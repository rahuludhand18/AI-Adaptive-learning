import datetime
from django.db import transaction
from .models import Subject, Topic, StudySession

def time_to_mins(t):
    """Helper: Converts a datetime.time object to total minutes from midnight."""
    return t.hour * 60 + t.minute

def mins_to_time(m):
    """Helper: Converts total minutes back to a datetime.time object."""
    return datetime.time(m // 60, m % 60)

class CapacityOverflowException(Exception):
    def __init__(self, unallocated_hours, message="Capacity reached before exam date."):
        self.unallocated_hours = unallocated_hours
        self.message = message
        super().__init__(self.message)

@transaction.atomic
def generate_timetable(user, subject_id, start_date, routine, daily_hours=2, weekend_warrior=False):
    subject = Subject.objects.get(id=subject_id, user=user)
    
    # Validation & Mode Handling
    exam_date = subject.target_exam_date
    if not exam_date:
        # Fallback if no exam date provided (for safety)
        exam_date = start_date + datetime.timedelta(days=30)
        
    delta_days = (exam_date - start_date).days
    
    plan_type = subject.plan_type.lower()
    
    if plan_type == 'study':
        if delta_days < 60:
            raise Exception("Exam is less than 60 days away. Study Mode disabled.")
        # Uses normal routine, uncompressed hours.
        daily_subject_hours = subject.daily_subject_hours
        
    elif plan_type == 'revision':
        if delta_days > 45:
            start_date = exam_date - datetime.timedelta(days=45)
            delta_days = 45
            
        daily_subject_hours = subject.daily_subject_hours
        if delta_days <= 1:
            # 1-Day Crunch
            daily_subject_hours = max(8, daily_subject_hours)
    else:
        daily_subject_hours = subject.daily_subject_hours

    # Fetch topics
    topics_qs = Topic.objects.filter(module__subject=subject).order_by('module__order_index', 'order_index')
    
    # Compression Logic for Revision Mode
    compression_ratio = 1.0
    if plan_type == 'revision':
        total_estimated_hours = sum(t.estimated_hours for t in topics_qs)
        total_available_days = (exam_date - start_date).days + 1
        total_revision_capacity_hours = total_available_days * daily_subject_hours
        
        if total_estimated_hours > total_revision_capacity_hours and total_revision_capacity_hours > 0:
            compression_ratio = total_revision_capacity_hours / total_estimated_hours

    topics_queue = []
    for topic in topics_qs:
        adjusted_hours = topic.estimated_hours * compression_ratio
        topics_queue.append({
            'topic_instance': topic,
            'remaining_minutes': int(adjusted_hours * 60)
        })

    current_date = start_date

    while topics_queue:
        if subject.target_exam_date and current_date > subject.target_exam_date:
            remaining_mins = sum(t['remaining_minutes'] for t in topics_queue)
            raise CapacityOverflowException(round(remaining_mins / 60.0, 1))
            
        max_minutes_today = daily_subject_hours * 60
        
        # Determine Free Gaps based on Mode
        free_gaps = []
        if plan_type == 'revision':
            # Ignore routine, massive 08:00 to 23:00 block
            free_gaps.append((8 * 60, 23 * 60))
        else:
            base_windows = []
            if routine.get('morning_study_start') and routine.get('morning_study_end'):
                base_windows.append((time_to_mins(routine['morning_study_start']), time_to_mins(routine['morning_study_end'])))
            if routine.get('evening_study_start') and routine.get('evening_study_end'):
                base_windows.append((time_to_mins(routine['evening_study_start']), time_to_mins(routine['evening_study_end'])))
                
            if not base_windows:
                base_windows.append((16 * 60, 20 * 60))
                
            routine_blocks = []
            def add_routine_block(start_key, end_key):
                if routine.get(start_key) and routine.get(end_key):
                    routine_blocks.append((time_to_mins(routine[start_key]), time_to_mins(routine[end_key])))
            add_routine_block('work_college_start', 'work_college_end')
            add_routine_block('snack_time_start', 'snack_time_end')
            add_routine_block('dinner_time_start', 'dinner_time_end')
            
            existing_sessions = StudySession.objects.filter(user=user, date=current_date).order_by('start_time')
            for session in existing_sessions:
                routine_blocks.append((time_to_mins(session.start_time), time_to_mins(session.end_time)))
                
            for bw_start, bw_end in base_windows:
                current_start = bw_start
                for b_start, b_end in sorted(routine_blocks):
                    if b_start < bw_end and b_end > current_start:
                        if b_start > current_start:
                            free_gaps.append((current_start, b_start))
                        current_start = max(current_start, b_end)
                if current_start < bw_end:
                    free_gaps.append((current_start, bw_end))
                    
        # Track Subject Specific Minutes Today
        # Get existing minutes for THIS specific subject today
        existing_subject_sessions = StudySession.objects.filter(user=user, date=current_date, topic__module__subject=subject)
        subject_minutes_today = sum(
            time_to_mins(s.end_time) - time_to_mins(s.start_time)
            for s in existing_subject_sessions
        )

        for gap_start, gap_end in free_gaps:
            if gap_start >= gap_end:
                continue
                
            current_time_pointer = gap_start
            while current_time_pointer < gap_end and topics_queue:
                available_time_in_gap = gap_end - current_time_pointer
                current_topic = topics_queue[0]
                
                time_to_schedule = min(current_topic['remaining_minutes'], available_time_in_gap)
                
                if subject_minutes_today + time_to_schedule > max_minutes_today:
                    time_to_schedule = max_minutes_today - subject_minutes_today
                    
                if time_to_schedule <= 0:
                    break
                
                StudySession.objects.create(
                    user=user,
                    topic=current_topic['topic_instance'],
                    date=current_date,
                    start_time=mins_to_time(current_time_pointer),
                    end_time=mins_to_time(current_time_pointer + time_to_schedule)
                )
                
                current_time_pointer += time_to_schedule
                current_topic['remaining_minutes'] -= time_to_schedule
                subject_minutes_today += time_to_schedule
                
                if current_topic['remaining_minutes'] <= 0:
                    topics_queue.pop(0)
                    
                if subject_minutes_today >= max_minutes_today:
                    break
            
            if subject_minutes_today >= max_minutes_today:
                break

        current_date += datetime.timedelta(days=1)

    return True
