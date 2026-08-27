import os
import pickle
import faiss
import numpy as np
import google.generativeai as genai

# Configure Gemini globally
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

# Lazy global variables for fast memory access (Singleton pattern)
_EMBEDDER = None
_FAISS_INDEX = None
_BM25_INDEX = None
_CHUNKS = None
_INDEXES_LOADED = False

def get_embedder():
    """Lazy load the sentence transformer to save memory and ensure lightning-fast startup."""
    global _EMBEDDER
    if _EMBEDDER is None:
        from sentence_transformers import SentenceTransformer
        _EMBEDDER = SentenceTransformer('all-MiniLM-L6-v2')
    return _EMBEDDER

def load_indexes(data_dir="student_data"):
    """Load FAISS and BM25 indexes into memory (Singleton) for O(1) repeated access."""
    global _FAISS_INDEX, _BM25_INDEX, _CHUNKS, _INDEXES_LOADED
    if _INDEXES_LOADED:
        return _FAISS_INDEX, _BM25_INDEX, _CHUNKS
        
    faiss_path = os.path.join(data_dir, "faiss_index.bin")
    if not os.path.exists(faiss_path):
        return None, None, None
        
    try:
        _FAISS_INDEX = faiss.read_index(faiss_path)
        with open(os.path.join(data_dir, "bm25_index.pkl"), "rb") as f:
            _BM25_INDEX = pickle.load(f)
        with open(os.path.join(data_dir, "chunks.pkl"), "rb") as f:
            _CHUNKS = pickle.load(f)
        _INDEXES_LOADED = True
    except Exception:
        pass
    
    return _FAISS_INDEX, _BM25_INDEX, _CHUNKS

def ask_focuspath(user_query, chat_history, mode, dynamic_db_context):
    index, bm25, chunks = load_indexes()
    
    retrieved_context = ""
    if index and bm25 and chunks and mode in ['SYLLABUS', 'PLANNER']:
        # Hybrid Retrieval
        k = 3
        
        # FAISS Retrieval (Vector Search O(log N) due to HNSW)
        embedder = get_embedder()
        query_embedding = embedder.encode([user_query], convert_to_numpy=True)
        faiss.normalize_L2(query_embedding)
        _, faiss_indices = index.search(query_embedding, k)
        faiss_set = set(faiss_indices[0].tolist())
        
        # BM25 Retrieval (Inverted Index O(1) term lookup)
        tokenized_query = user_query.lower().split()
        bm25_scores = bm25.get_scores(tokenized_query)
        # Using argpartition for faster Top-K (Advanced DSA: O(N) instead of O(N log N) sorting)
        if len(bm25_scores) > k:
            bm25_indices = np.argpartition(bm25_scores, -k)[-k:]
        else:
            bm25_indices = np.argsort(bm25_scores)[::-1][:k]
        bm25_set = set(bm25_indices.tolist())
        
        # Set Union
        hybrid_indices = list(faiss_set.union(bm25_set))
        valid_indices = [i for i in hybrid_indices if 0 <= i < len(chunks)]
        retrieved_context = "\n\n".join([chunks[i] for i in valid_indices])

    # Mode Routing & System Instructions
    system_instruction = ""
    generation_config = genai.types.GenerationConfig()
    
    if mode == 'GENERAL':
        system_instruction = "Act as a helpful, encouraging academic advisor. Answer standard study technique questions without needing deep document context."
        generation_config.temperature = 0.7
        
    elif mode == 'SYLLABUS':
        system_instruction = f"Act as a subject-matter expert. Use the Hybrid RAG context strictly to break down the uploaded syllabus, explain core concepts, and estimate the difficulty of specific modules.\n\nContext:\n{retrieved_context}"
        generation_config.temperature = 0.5
        
    elif mode == 'PLANNER':
        tasks = dynamic_db_context.get('tasks', [])
        progress = dynamic_db_context.get('progress', 0)
        upcoming_blocks = dynamic_db_context.get('upcoming_blocks', [])
        
        system_instruction = f"""
You are FocusPath's strict and precise Academic Timetable Planner. Your objective is to calculate and generate a highly optimized study schedule based on uploaded syllabi.

DYNAMIC CONTEXT PROVIDED TO YOU:
- Syllabus Data: {retrieved_context}
- Target Modules: Identify from the user's prompt (e.g., "Module 1 and 2")
- Exam Date / Deadline: Identify from the user's prompt
- Available Study Hours Per Week: Identify from the user's prompt
- Existing Planned Tasks: {tasks}

PHASE 1: PRE-REQUISITE GATEKEEPER
Before generating any timetable, check the DYNAMIC CONTEXT. 
If the user's prompt does not contain an Exam Date / Deadline OR Available Study Hours Per Week, DO NOT generate a schedule. 
Instead, ask the user: "To create an accurate timetable, please tell me: 1) What is your target completion date (or exam date)? and 2) How many hours per week can you dedicate to studying?"

PHASE 2: STRICT TOPIC FILTERING
When analyzing the Syllabus Data to create study blocks, you MUST ONLY extract actual academic topics.
RULES FOR EXTRACTING STUDY TOPICS:
You must ONLY schedule blocks for actual academic subjects found under "Module" or "Chapter" headings. 

EXAMPLES OF BAD TOPICS (DO NOT DO THIS):
❌ "Course Code BCS515B"
❌ "Total Hours of Pedagogy 40"
❌ "Teaching Hours/Week"
❌ "CIE Marks 50"

EXAMPLES OF GOOD TOPICS (DO THIS):
✅ "Module 1: Intelligent Agents & Rationality"
✅ "Chapter 3: Uninformed Search Strategies"
✅ "Module 4: First Order Logic"

PHASE 3: CALCULATION & STRUCTURING (Only if Phase 1 passes)
1. Workload Assessment: Divide the total syllabus topics across the available weeks.
2. Distribution: Break down the modules into logical daily/weekly study blocks. Assign specific academic chapters to each block.

OUTPUT FORMAT:
- **Total Workload:** [X] Hours
- **Time Remaining:** [Y] Weeks / Days
- **Schedule:**
  - [Date]: [Specific Academic Topic / Chapter] - [Estimated Hours]
"""
        generation_config.temperature = 0.1

    # Gemini 3.6 Flash
    model = genai.GenerativeModel(
        model_name="gemini-3.6-flash",
        system_instruction=system_instruction,
        generation_config=generation_config
    )
    
    # Format History (last 4 messages)
    formatted_history = []
    last_role = None
    
    for msg in chat_history[-4:]:
        role = 'model' if msg.get('role') == 'bot' else 'user'
        if role != last_role:
            formatted_history.append({'role': role, 'parts': [msg.get('text', '')]})
            last_role = role
        else:
            # Combine sequential roles to prevent Gemini API crashes
            formatted_history[-1]['parts'][0] += "\n" + msg.get('text', '')
            
    # Prevent Gemini 400 Error: "Ensure model and user roles alternate"
    # If the last message in history was 'user', and we are sending another 'user' query, combine them.
    if last_role == 'user':
        last_user_msg = formatted_history.pop()['parts'][0]
        user_query = f"{last_user_msg}\n{user_query}"
        
    chat = model.start_chat(history=formatted_history)
    response = chat.send_message(user_query)
    
    return response.text

# --- Notebook LM / Video Chat feature ---
def get_video_transcript(video_id):
    from youtube_transcript_api import YouTubeTranscriptApi
    try:
        transcript_list = YouTubeTranscriptApi.get_transcript(video_id)
        # combine the text
        full_text = " ".join([t['text'] for t in transcript_list])
        return full_text
    except Exception as e:
        return f"Error retrieving transcript: {str(e)}"

def ask_video_bot(video_id, user_query, chat_history, is_breakdown=False):
    transcript = get_video_transcript(video_id)
    
    system_instruction = f"""
You are an expert AI Tutor powered by NotebookLM-style capabilities. 
Your goal is to help a child understand the video they are currently watching.
Always be encouraging, enthusiastic, and speak simply so a kid can understand.

VIDEO TRANSCRIPT CONTEXT:
{transcript[:30000]} # Limit to ~30k chars to prevent token overflow
"""
    
    generation_config = genai.types.GenerationConfig(temperature=0.6)
    
    model = genai.GenerativeModel(
        model_name="gemini-3.6-flash",
        system_instruction=system_instruction,
        generation_config=generation_config
    )
    
    if is_breakdown:
        prompt = "Please provide a highly engaging, structured, and simple summary (breakdown) of what this video teaches, using emojis. Limit to 3 short paragraphs."
        return model.generate_content(prompt).text

    # Format History
    formatted_history = []
    last_role = None
    for msg in chat_history[-6:]:
        role = 'model' if msg.get('role') == 'bot' else 'user'
        if role != last_role:
            formatted_history.append({'role': role, 'parts': [msg.get('text', '')]})
            last_role = role
        else:
            formatted_history[-1]['parts'][0] += "\n" + msg.get('text', '')
            
    if last_role == 'user':
        last_user_msg = formatted_history.pop()['parts'][0]
        user_query = f"{last_user_msg}\n{user_query}"
        
    chat = model.start_chat(history=formatted_history)
    response = chat.send_message(user_query)
    return response.text
