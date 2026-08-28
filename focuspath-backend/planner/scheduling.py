from datetime import timedelta


# Turn pasted/extracted syllabus text into subjects WITH their topics.
# One subject per line. Topics can follow a ':' or ' - ' and be separated by commas/semicolons,
# e.g. "Data Structures: Arrays, Linked Lists, Trees". Lines without topics just have [].
# Returns [{'name': str, 'topics': [str, ...]}]. Shared by the text and file endpoints.
import json
import os

import json
import os

try:
    import google.generativeai as genai
    from utils.ai import get_random_gemini_key
except ImportError:
    pass
SYLLABUS_EXTRACTION_PROMPT = """
You are an expert academic data extractor. Your objective is to analyze a raw college syllabus and convert it into a strict JSON payload.

CRITICAL RULES FOR EXTRACTION:
1. STRICT FILTERING (NO ADMINISTRATIVE TEXT): You must completely ignore and exclude administrative headers, including but not limited to: "Course Code", "CIE Marks", "SEE Marks", "Credits", "Exam Hours", "Course objectives", "Teaching-Learning Process", and "Annexure".
2. ACADEMIC CONTENT ONLY: Only extract actual academic concepts, chapter names, and module titles. 
3. TOTAL COURSE HOURS: Search the document for "Total Hours of Pedagogy", "Total Teaching Hours", or "Lecture Hours". Add this as an integer `total_course_hours` at the root level. If not found, do your best to estimate total hours.
4. INDEXING: Provide an ascending integer `order_index` for modules and topics so they remain in chronological order.

OUTPUT FORMAT:
You must return ONLY valid JSON. Do not wrap the JSON in markdown formatting blocks. The JSON must perfectly match this schema:

{
  "subject_name": "String (e.g., Artificial Intelligence)",
  "total_course_hours": 40,
  "modules": [
    {
      "title": "String (e.g., Module 1: Introduction & Intelligent Agents)",
      "order_index": 1,
      "topics": [
        {
          "name": "String (e.g., The structure of agents)",
          "order_index": 1
        },
        {
          "name": "String (e.g., Concept of Rationality)",
          "order_index": 2
        }
      ]
    }
  ]
}
"""

def extract_syllabus_to_json(llama_parse_markdown):
    genai.configure(api_key=get_random_gemini_key())
    # Force Gemini to output raw JSON without markdown blocks
    generation_config = genai.GenerationConfig(
        response_mime_type="application/json",
        temperature=0.1 # Keep temperature very low for data extraction
    )
    
    model = genai.GenerativeModel(
        model_name="gemini-3.6-flash",
        system_instruction=SYLLABUS_EXTRACTION_PROMPT,
        generation_config=generation_config
    )
    
    response = model.generate_content(llama_parse_markdown)
    
    try:
        # Instantly converts the LLM output into a Python dictionary!
        structured_data = json.loads(response.text)
        return structured_data
    except json.JSONDecodeError:
        print("Failed to parse JSON.")
        return None



# Move a datetime forward to the next moment inside the daily study window
# [day_start_hour, day_end_hour). Before the window -> that day's start hour;
# at/after the window -> the next day's start hour. Keeps tzinfo intact.
def clamp_to_window(dt, day_start_hour=9, day_end_hour=21):
    if dt.hour < day_start_hour:
        return dt.replace(hour=day_start_hour, minute=0, second=0, microsecond=0)
    if dt.hour >= day_end_hour:
        return (dt + timedelta(days=1)).replace(hour=day_start_hour, minute=0, second=0, microsecond=0)
    return dt


# Generate a study timetable from subjects + a finish-by date + hours/day.
# Higher-difficulty subjects get proportionally more study blocks and are scheduled
# earlier. Each block is 45 minutes inside hourly slots. Study happens only inside the
# daily window [day_start_hour, day_end_hour); the FIRST day begins at generation time
# (rounded up to the next hour) so no block is ever placed in the past.
# start_dt must be a timezone-aware datetime (e.g. timezone.localtime(timezone.now()));
# all returned datetimes stay aware because they are derived from it.
def generate_schedule(subjects, daily_hours, finish_by_date, start_dt, day_start_hour=9, day_end_hour=21):
    tasks = []

    # clean + clamp difficulty to 1..5, and keep each subject's topic list
    clean = []
    topics_by_name = {}
    for s in subjects:
        name = (s.get('name') or '').strip()
        if not name:
            continue
        diff = s.get('difficulty', 3)
        try:
            diff = max(1, min(5, int(diff)))
        except (TypeError, ValueError):
            diff = 3
        clean.append((name, diff))
        topics = s.get('topics') or []
        topics_by_name[name] = [str(t).strip() for t in topics if str(t).strip()]
    if not clean:
        return tasks

    # a subject appears `difficulty` times so harder subjects get more blocks;
    # sorted hardest-first so urgent subjects land earlier
    deck = []
    for name, diff in sorted(clean, key=lambda x: -x[1]):
        deck.extend([(name, diff)] * diff)

    # rotate through each subject's topics so consecutive blocks cover different content
    topic_cursor = {}

    def next_topic(subject_name):
        topics = topics_by_name.get(subject_name) or []
        if not topics:
            return 'Focused study session'
        i = topic_cursor.get(subject_name, 0)
        topic_cursor[subject_name] = i + 1
        return topics[i % len(topics)]

    day_span = (finish_by_date - start_dt.date()).days
    days = max(1, day_span + 1)
    blocks_per_day = max(1, int(daily_hours or 1))
    finish_dt = start_dt.replace(hour=23, minute=59, second=0, microsecond=0) + timedelta(days=max(0, day_span))

    n = len(deck)
    idx = 0
    for d in range(days):
        day_midnight = start_dt.replace(hour=0, minute=0, second=0, microsecond=0) + timedelta(days=d)
        if d == 0:
            # start from the next full hour after "now", but not before the window opens
            begin_hour = start_dt.hour + (1 if (start_dt.minute or start_dt.second or start_dt.microsecond) else 0)
            begin_hour = max(day_start_hour, begin_hour)
        else:
            begin_hour = day_start_hour

        for b in range(blocks_per_day):
            hour = begin_hour + b
            if hour >= day_end_hour:
                break  # outside the daily study window; remaining blocks roll to later days
            name, diff = deck[idx % n]
            idx += 1
            start = day_midnight + timedelta(hours=hour)
            end = start + timedelta(minutes=45)  # 45-min block inside a 1-hour slot (15-min break after)
            priority = 3 if diff >= 4 else (2 if diff == 3 else 1)
            tasks.append({
                'title': name,
                'description': next_topic(name),  # the specific topic this block covers
                'start_time': start,
                'end_time': end,
                'deadline': finish_dt,
                'priority': priority,
            })
    return tasks
