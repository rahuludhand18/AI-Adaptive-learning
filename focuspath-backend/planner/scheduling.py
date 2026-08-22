from datetime import timedelta


# Generate a study timetable from subjects + a finish-by date + hours/day.
# Higher-difficulty subjects get proportionally more study blocks and are scheduled
# earlier. Each block is 45 minutes inside hourly slots starting at day_start_hour.
# start_dt must be a timezone-aware datetime (e.g. timezone.localtime(timezone.now()));
# all returned datetimes stay aware because they are derived from it.
def generate_schedule(subjects, daily_hours, finish_by_date, start_dt, day_start_hour=9):
    tasks = []

    # clean + clamp difficulty to 1..5
    clean = []
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
    if not clean:
        return tasks

    # a subject appears `difficulty` times so harder subjects get more blocks;
    # sorted hardest-first so urgent subjects land earlier
    deck = []
    for name, diff in sorted(clean, key=lambda x: -x[1]):
        deck.extend([(name, diff)] * diff)

    day_span = (finish_by_date - start_dt.date()).days
    days = max(1, day_span + 1)
    blocks_per_day = max(1, int(daily_hours or 1))

    anchor = start_dt.replace(hour=day_start_hour, minute=0, second=0, microsecond=0)
    finish_dt = start_dt.replace(hour=23, minute=59, second=0, microsecond=0) + timedelta(days=max(0, day_span))

    n = len(deck)
    idx = 0
    for d in range(days):
        for b in range(blocks_per_day):
            name, diff = deck[idx % n]
            idx += 1
            start = anchor + timedelta(days=d, hours=b)
            end = start + timedelta(minutes=45)  # 45-min block inside a 1-hour slot (15-min break)
            priority = 3 if diff >= 4 else (2 if diff == 3 else 1)
            tasks.append({
                'title': name,
                'description': f'Study block (difficulty {diff})',
                'start_time': start,
                'end_time': end,
                'deadline': finish_dt,
                'priority': priority,
            })
    return tasks
