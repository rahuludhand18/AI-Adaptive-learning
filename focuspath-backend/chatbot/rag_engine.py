import os
import pickle
import numpy as np
import google.generativeai as genai
from utils.ai import get_random_gemini_key

# Lazy global variables for fast memory access (Singleton pattern)
_EMBEDDER = None
_FAISS_INDEX = None
_BM25_INDEX = None
_CHUNKS = None
_INDEXES_LOADED = False

def get_faiss():
    """Safely import faiss with graceful fallback if native binaries are blocked or unavailable."""
    try:
        import faiss
        return faiss
    except Exception:
        return None

def configure_gemini():
    """Configure Gemini with clean environment and REST transport."""
    if "GOOGLE_APPLICATION_CREDENTIALS" in os.environ:
        del os.environ["GOOGLE_APPLICATION_CREDENTIALS"]
    genai.configure(api_key=get_random_gemini_key(), transport='rest')

def get_embedder():
    """Only use sentence transformer if already initialized to prevent PyTorch cold-start freezes."""
    global _EMBEDDER
    import sys
    if 'sentence_transformers' in sys.modules and _EMBEDDER is not None:
        return _EMBEDDER
    return None

def load_indexes(data_dir="student_data"):
    """Load FAISS and BM25 indexes into memory (Singleton) for O(1) repeated access."""
    global _FAISS_INDEX, _BM25_INDEX, _CHUNKS, _INDEXES_LOADED
    if _INDEXES_LOADED:
        return _FAISS_INDEX, _BM25_INDEX, _CHUNKS
        
    faiss_path = os.path.join(data_dir, "faiss_index.bin")
    if not os.path.exists(faiss_path):
        return None, None, None
        
    try:
        faiss_lib = get_faiss()
        if faiss_lib:
            _FAISS_INDEX = faiss_lib.read_index(faiss_path)
        with open(os.path.join(data_dir, "bm25_index.pkl"), "rb") as f:
            _BM25_INDEX = pickle.load(f)
        with open(os.path.join(data_dir, "chunks.pkl"), "rb") as f:
            _CHUNKS = pickle.load(f)
        _INDEXES_LOADED = True
    except Exception:
        pass
    
    return _FAISS_INDEX, _BM25_INDEX, _CHUNKS

def ask_focuspath(user_query, chat_history, mode, dynamic_db_context):
    configure_gemini()
    index, bm25, chunks = load_indexes()
    
    retrieved_context = ""
    if chunks:
        # Hybrid Retrieval across all modes
        k = 4
        faiss_set = set()
        faiss_lib = get_faiss()
        
        # FAISS Retrieval (Vector Search O(log N) due to HNSW)
        if index and faiss_lib:
            try:
                embedder = get_embedder()
                if embedder:
                    query_embedding = embedder.encode([user_query], convert_to_numpy=True)
                    faiss_lib.normalize_L2(query_embedding)
                    _, faiss_indices = index.search(query_embedding, k)
                    faiss_set = set(faiss_indices[0].tolist())
            except Exception:
                faiss_set = set()
        
        # BM25 Retrieval (Inverted Index O(1) term lookup)
        bm25_set = set()
        if bm25:
            tokenized_query = user_query.lower().split()
            bm25_scores = bm25.get_scores(tokenized_query)
            if len(bm25_scores) > k:
                bm25_indices = np.argpartition(bm25_scores, -k)[-k:]
            else:
                bm25_indices = np.argsort(bm25_scores)[::-1][:k]
            bm25_set = set(bm25_indices.tolist())
        
        # Set Union
        hybrid_indices = list(faiss_set.union(bm25_set))
        valid_indices = [i for i in hybrid_indices if 0 <= i < len(chunks)]
        
        # Broad keyword check: if user asks about syllabus or curriculum, ensure top chunks are present
        syllabus_keywords = ['syllabus', 'course', 'curriculum', 'topics', 'module', 'what is in', 'subject', 'exam']
        if any(w in user_query.lower() for w in syllabus_keywords) or not valid_indices:
            valid_indices = list(dict.fromkeys(valid_indices + list(range(min(len(chunks), 5)))))
            
        retrieved_context = "\n\n".join([chunks[i] for i in valid_indices if 0 <= i < len(chunks)])

    # Mode Routing & System Instructions
    system_instruction = ""
    generation_config = genai.types.GenerationConfig()
    live_schedule = dynamic_db_context.get('live_schedule', '')
    
    if mode == 'GENERAL':
        system_instruction = f"""You are FocusPath's Intelligent Academic Advisor and Live Platform Companion.
You have FULL REAL-TIME ACCESS to the user's platform state, enrolled courses, syllabus documents, daily timetable, and focus metrics.

REAL-TIME PLATFORM DATA & USER CONTEXT:
{live_schedule}

UPLOADED SYLLABUS & COURSE DOCUMENTS (RAG RETRIEVAL):
{retrieved_context if retrieved_context else "No uploaded syllabus documents currently found."}

INSTRUCTIONS:
1. Always leverage the real-time platform data and syllabus context above to give precise, personalized, and context-aware responses.
2. If the user asks about their syllabus, courses, topics, schedule, tasks, or study performance, answer directly using the real data provided. NEVER say you lack access to their syllabus or platform data.
3. Be encouraging, actionable, and structured in your guidance.
4. Date & Day Accuracy: Always use the exact weekday explicitly stated in REAL-TIME PLATFORM DATA (e.g. November 20, 2026 is Friday, NOT Thursday). Never guess or misstate the day of the week.
5. Exact Session Timing: When telling the user about scheduled study sessions, always quote the exact session times from the TIMETABLE (e.g., 07:00 - 08:00 AM). Do NOT confuse or replace the session time with their broad preferred routine window (e.g., 07:00 - 09:00). State clearly that the session itself is 07:00 to 08:00 AM."""
        generation_config.temperature = 0.7
        
    elif mode == 'SYLLABUS':
        system_instruction = f"""You are FocusPath's Subject-Matter & Syllabus Expert.
Use the uploaded syllabus documents and live platform curriculum to break down subjects, explain core concepts, outline modules, and assess difficulty.

REAL-TIME PLATFORM DATA & USER CONTEXT:
{live_schedule}

SYLLABUS DATA (RAG RETRIEVAL):
{retrieved_context}
"""
        generation_config.temperature = 0.5
        
    elif mode == 'PLANNER':
        tasks = dynamic_db_context.get('tasks', [])
        progress = dynamic_db_context.get('progress', 0)
        upcoming_blocks = dynamic_db_context.get('upcoming_blocks', [])
        
        system_instruction = f"""You are FocusPath's strict and precise Academic Timetable Planner. Your objective is to calculate and generate a highly optimized study schedule based on the user's live platform curriculum and uploaded syllabus.

REAL-TIME PLATFORM DATA & USER CONTEXT:
{live_schedule}

DYNAMIC CONTEXT PROVIDED TO YOU:
- Syllabus Data: {retrieved_context}
- Target Modules: Identify from the user's prompt (e.g., "Module 1 and 2")
- Exam Date / Deadline: Identify from the user's prompt
- Available Study Hours Per Week: Identify from the user's prompt
- Existing Planned Tasks: {tasks}
- Current Progress: {progress}%

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

    # Only load tools if in PLANNER mode or if user is asking to schedule/plan tasks
    # This prevents 5-10s of function calling negotiation latency on standard conversational turns
    needs_tools = (mode == 'PLANNER') or any(w in user_query.lower() for w in [
        'schedule', 'add block', 'study block', 'plan block', 'create session', 'add session', 'timetable block'
    ])
    
    tools = None
    if needs_tools:
        system_instruction += "\nIf the user asks to schedule, add, or plan a study block, extract the subject, date, and time, and call the create_study_block function. If the user mentions a day like 'Wednesday', calculate the exact YYYY-MM-DD for the next occurrence of that day."
        tools = [{
            "function_declarations": [
                {
                    "name": "create_study_block",
                    "description": "Create a new study block in the timetable.",
                    "parameters": {
                        "type": "OBJECT",
                        "properties": {
                            "subject_name": {"type": "STRING", "description": "Subject name"},
                            "date": {"type": "STRING", "description": "YYYY-MM-DD"},
                            "start_time": {"type": "STRING", "description": "HH:MM format"},
                            "duration_minutes": {"type": "INTEGER", "description": "Duration in minutes"}
                        },
                        "required": ["subject_name", "date", "start_time"]
                    }
                }
            ]
        }]

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
            if formatted_history:
                formatted_history[-1]['parts'][0] += "\n" + msg.get('text', '')
            else:
                formatted_history.append({'role': role, 'parts': [msg.get('text', '')]})
                last_role = role
            
    # Gemini Multiturn Rule: The first message in history MUST be from the 'user' role
    while formatted_history and formatted_history[0]['role'] == 'model':
        formatted_history.pop(0)

    # If the last message in history was 'user', combine it with user_query to preserve alternation
    if formatted_history and formatted_history[-1]['role'] == 'user':
        last_user_msg = formatted_history.pop()['parts'][0]
        user_query = f"{last_user_msg}\n{user_query}"
        
    model = genai.GenerativeModel(
        model_name="gemini-flash-lite-latest",
        system_instruction=system_instruction,
        generation_config=generation_config,
        tools=tools
    )
    
    chat = model.start_chat(history=formatted_history)
    response = chat.send_message(user_query)
    
    # Return chat object and response so views.py can handle function calls
    return chat, response

# --- Notebook LM / Video Chat feature ---
def get_video_transcript(video_id):
    try:
        from youtube_transcript_api import YouTubeTranscriptApi
        ytt = YouTubeTranscriptApi()
        
        # 1. Direct fetch with preferred languages
        try:
            fetched = ytt.fetch(video_id, languages=['en', 'en-IN', 'en-US', 'en-GB', 'hi', 'hi-IN'])
            return " ".join(s.text for s in fetched.snippets)
        except Exception:
            pass
            
        # 2. Iterate transcript list and translate or fetch
        try:
            transcript_list = ytt.list(video_id)
            for t in transcript_list:
                try:
                    if getattr(t, 'is_translatable', False):
                        translated = t.translate('en').fetch()
                        return " ".join(s.text for s in translated.snippets)
                    else:
                        fetched = t.fetch()
                        return " ".join(s.text for s in fetched.snippets)
                except Exception:
                    continue
        except Exception:
            pass
            
        return "Note: Captions are not available for this video."
    except Exception as e:
        return f"Note: Transcript extraction unavailable ({str(e)})."

def ask_video_bot(video_id, user_query, chat_history, is_breakdown=False, video_title=""):
    configure_gemini()
    
    if is_breakdown:
        from content.models import AINotes
        cached_notes = AINotes.objects.filter(video_id=video_id).first()
        if cached_notes:
            return cached_notes.notes_markdown
            
    transcript = get_video_transcript(video_id)
    
    system_instruction = f"""You are an enthusiastic, friendly AI Study Buddy and Tutor for kids.
The student is currently watching this educational video:
Title: {video_title or 'Educational Lesson'}
Video ID: {video_id}

VIDEO TRANSCRIPT CONTEXT:
{transcript[:30000]}

INSTRUCTIONS:
1. Explain the video and answer any questions the student has simply, clearly, and engagingly.
2. Use fun examples, simple analogies, and emojis suitable for kids.
3. If the transcript is brief or unavailable, explain the subject from the video title using your academic knowledge.
4. Keep explanations clear, positive, and motivating!
"""
    
    generation_config = genai.types.GenerationConfig(temperature=0.6)
    
    model = genai.GenerativeModel(
        model_name="gemini-flash-lite-latest",
        system_instruction=system_instruction,
        generation_config=generation_config
    )
    
    if is_breakdown:
        prompt = f"Please provide a highly engaging, structured, and simple summary (breakdown) of what this video ({video_title or 'this topic'}) teaches, using emojis. Limit to 3 short paragraphs."
        notes = model.generate_content(prompt).text
        from content.models import AINotes
        AINotes.objects.create(video_id=video_id, notes_markdown=notes)
        return notes

    # Format History
    formatted_history = []
    last_role = None
    for msg in chat_history[-6:]:
        role = 'model' if msg.get('role') == 'bot' else 'user'
        if role != last_role:
            formatted_history.append({'role': role, 'parts': [msg.get('text', '')]})
            last_role = role
        else:
            if formatted_history:
                formatted_history[-1]['parts'][0] += "\n" + msg.get('text', '')
            else:
                formatted_history.append({'role': role, 'parts': [msg.get('text', '')]})
                last_role = role
            
    while formatted_history and formatted_history[0]['role'] == 'model':
        formatted_history.pop(0)

    if formatted_history and formatted_history[-1]['role'] == 'user':
        last_user_msg = formatted_history.pop()['parts'][0]
        user_query = f"{last_user_msg}\n{user_query}"
        
    chat = model.start_chat(history=formatted_history)
    response = chat.send_message(user_query)
    return response.text
