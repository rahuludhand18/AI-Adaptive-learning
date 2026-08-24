from datetime import timedelta


# Turn pasted/extracted syllabus text into subjects WITH their topics.
# One subject per line. Topics can follow a ':' or ' - ' and be separated by commas/semicolons,
# e.g. "Data Structures: Arrays, Linked Lists, Trees". Lines without topics just have [].
# Returns [{'name': str, 'topics': [str, ...]}]. Shared by the text and file endpoints.
def parse_syllabus_text(text):
    seen = set()
    subjects = []
    for line in (text or '').splitlines():
        raw = line.strip(' -*•\t')
        if len(raw) < 2:
            continue
        # split name from the topic list on the first ':' or ' - '
        name, sep, rest = raw.partition(':')
        if not sep:
            name, sep, rest = raw.partition(' - ')
        name = name.strip()
        if len(name) < 2:
            continue
        key = name.lower()
        if key in seen:
            continue
        seen.add(key)
        topics = []
        for chunk in rest.replace(';', ',').split(','):
            t = chunk.strip(' -*•\t')
            if len(t) >= 2:
                topics.append(t[:120])
        subjects.append({'name': name[:120], 'topics': topics[:20]})
    return subjects[:30]


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
