from django.utils import timezone
from rest_framework import generics, status, views
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied
from rest_framework.parsers import MultiPartParser, FormParser
import tempfile
import os
from llama_parse import LlamaParse
from .models import Subject, Module, Topic, StudySession
from .serializers import SubjectSerializer, ModuleSerializer, TopicSerializer, StudySessionSerializer
from .scheduling import extract_syllabus_to_json
from users.models import User, ParentChildRelation

class ChildResolverMixin:
    def get_target_user(self, request):
        if request.user.role == User.Roles.PARENT:
            child_id = request.headers.get('X-Child-Id') or request.query_params.get('child_id')
            if child_id:
                relation = ParentChildRelation.objects.filter(parent=request.user, child_id=child_id).first()
                if relation:
                    return relation.child
        return request.user
class SubjectListCreateView(ChildResolverMixin, generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = SubjectSerializer

    def get_queryset(self):
        target_user = self.get_target_user(self.request)
        return Subject.objects.filter(user=target_user).prefetch_related('modules__topics')

    def perform_create(self, serializer):
        user = self.request.user
        target_user = self.get_target_user(self.request)
        if user.role == User.Roles.KID:
            raise PermissionDenied("Kids are not allowed to create subjects.")
        serializer.save(user=target_user)

class SubjectRetrieveUpdateDestroyView(ChildResolverMixin, generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = SubjectSerializer

    def get_queryset(self):
        target_user = self.get_target_user(self.request)
        return Subject.objects.filter(user=target_user).prefetch_related('modules__topics')


class StudySessionListCreateView(ChildResolverMixin, generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = StudySessionSerializer

    def get_queryset(self):
        target_user = self.get_target_user(self.request)
        return StudySession.objects.filter(user=target_user).select_related('topic__module__subject')

    def create(self, request, *args, **kwargs):
        data = request.data.copy() if hasattr(request.data, 'copy') else dict(request.data)
        if 'topic' not in data and 'subject_name' in data:
            target_user = self.get_target_user(request)
            from .models import Subject, Module, Topic
            subject = Subject.objects.filter(user=target_user, name=data['subject_name']).first()
            if not subject:
                subject, _ = Subject.objects.get_or_create(
                    user=target_user,
                    name=data['subject_name'],
                    defaults={
                        'daily_subject_hours': 1.0,
                        'plan_type': 'Study',
                        'difficulty': 'Medium',
                        'color_code': '#4F46E5'
                    }
                )
                
            module = Module.objects.filter(subject=subject, title="Custom Blocks").first()
            if not module:
                module, _ = Module.objects.get_or_create(
                    subject=subject, 
                    title="Custom Blocks",
                    defaults={'order_index': 999}
                )
                
            topic_name = data.get('topic_name') or 'Custom Study'
            topic = Topic.objects.filter(module=module, name=topic_name).first()
            if not topic:
                topic, _ = Topic.objects.get_or_create(
                    module=module, 
                    name=topic_name, 
                    defaults={'estimated_hours': 1.0}
                )
            
            data['topic'] = topic.id
            
        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def perform_create(self, serializer):
        user = self.request.user
        target_user = self.get_target_user(self.request)
        if user.role == User.Roles.KID:
            raise PermissionDenied("Kids are not allowed to create sessions manually.")
        serializer.save(user=target_user)

class StudySessionRetrieveUpdateDestroyView(ChildResolverMixin, generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = StudySessionSerializer

    def get_queryset(self):
        target_user = self.get_target_user(self.request)
        return StudySession.objects.filter(user=target_user).select_related('topic__module__subject')

import datetime
from .services import generate_timetable

class GenerateScheduleView(ChildResolverMixin, views.APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        subject_id = request.data.get('subject_id')
        target_date_str = request.data.get('target_exam_date') or request.data.get('exam_date')
        weekend_warrior = request.data.get('weekend_warrior', False)
        daily_hours = int(request.data.get('daily_hours', 2))
        
        if not subject_id:
            return Response({"error": "subject_id is required."}, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            from .services import CapacityOverflowException
            from .models import Subject
            from users.models import UserRoutine
            start_date = datetime.date.today()
            target_user = self.get_target_user(request)
            
            subject = Subject.objects.get(id=subject_id, user=target_user)
            if target_date_str:
                subject.target_exam_date = datetime.datetime.strptime(target_date_str, '%Y-%m-%d').date()
                subject.save()
            
            user_routine = UserRoutine.objects.filter(user=target_user).first()
            if not user_routine:
                return Response({"error": "Global daily routine not found. Please configure it first."}, status=status.HTTP_400_BAD_REQUEST)

            parsed_routine = {
                'morning_study_start': user_routine.morning_study_start,
                'morning_study_end': user_routine.morning_study_end,
                'work_college_start': user_routine.work_college_start,
                'work_college_end': user_routine.work_college_end,
                'evening_study_start': user_routine.evening_study_start,
                'evening_study_end': user_routine.evening_study_end,
                'snack_time_start': user_routine.snack_time_start,
                'snack_time_end': user_routine.snack_time_end,
                'dinner_time_start': user_routine.dinner_time_start,
                'dinner_time_end': user_routine.dinner_time_end,
            }
            
            generate_timetable(target_user, subject_id, start_date, parsed_routine, daily_hours, weekend_warrior)
            
            return Response({"detail": "Schedule generated successfully."}, status=status.HTTP_201_CREATED)
        except Subject.DoesNotExist:
            return Response({"error": "Subject not found."}, status=status.HTTP_404_NOT_FOUND)
        except CapacityOverflowException as e:
            return Response({
                "status": "overflow", 
                "unallocated_hours": e.unallocated_hours, 
                "message": e.message
            }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class SyllabusUploadView(ChildResolverMixin, views.APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = (MultiPartParser, FormParser)
    
    def post(self, request):
        if 'file' not in request.FILES:
            return Response({"error": "No file uploaded."}, status=status.HTTP_400_BAD_REQUEST)
            
        file_obj = request.FILES['file']
        user = request.user
        
        # Save temp file
        with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
            for chunk in file_obj.chunks():
                tmp.write(chunk)
            tmp_path = tmp.name

        try:
            # Parse PDF to markdown
            parser = LlamaParse(result_type="markdown")
            documents = parser.load_data(tmp_path)
            
            full_text = "\n\n".join([doc.text for doc in documents])
                
            # AI Extraction
            structured_data = extract_syllabus_to_json(full_text)
            
            if not structured_data:
                return Response({"error": "Failed to extract structured data from syllabus."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
                
            # Create DB Records
            provided_subject_name = request.data.get('subject_name')
            difficulty = request.data.get('difficulty', 'Medium')
            
            # 1. Base Math
            total_course_hours = int(structured_data.get('total_course_hours') or 40)
            modules = structured_data.get('modules', [])
            num_modules = len(modules) if len(modules) > 0 else 1
            base_module_time = total_course_hours / num_modules
            
            # 2. Difficulty Multiplier
            if difficulty.lower() == 'hard':
                mult = 1.25
            elif difficulty.lower() == 'easy':
                mult = 0.75
            else:
                mult = 1.0
                
            adjusted_module_time = base_module_time * mult
            
            subject_name = provided_subject_name if provided_subject_name else structured_data.get('subject_name', 'Unknown Subject')
            
            target_user = self.get_target_user(request)
            subject = Subject.objects.create(
                user=target_user,
                name=subject_name,
                target_exam_date=None,
                difficulty=difficulty
            )
            
            for mod_data in modules:
                module = Module.objects.create(
                    subject=subject,
                    title=mod_data.get('title', 'Module'),
                    order_index=mod_data.get('order_index', 0)
                )
                
                topics = mod_data.get('topics', [])
                num_topics = len(topics) if len(topics) > 0 else 1
                hours_per_topic = adjusted_module_time / num_topics
                
                for top_data in topics:
                    Topic.objects.create(
                        module=module,
                        name=top_data.get('name', 'Topic'),
                        estimated_hours=hours_per_topic,
                        order_index=top_data.get('order_index', 0)
                    )
                    
            return Response({"detail": f"Successfully extracted and saved subject: {subject.name}"}, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            import traceback
            traceback.print_exc()
            print(f"Extraction failed with error: {str(e)}")
            return Response({"error": "Extraction failed", "details": str(e)}, status=400)
        finally:
            if os.path.exists(tmp_path):
                os.remove(tmp_path)


class SyllabusMultiUploadView(ChildResolverMixin, views.APIView):
    """
    Upload a SINGLE combined PDF that contains ALL subjects.
    The AI extracts multiple subjects with their modules & topics and saves them all.
    Available to PARENT and ADULT roles (not KID).
    """
    permission_classes = [IsAuthenticated]
    parser_classes = (MultiPartParser, FormParser)

    def post(self, request):
        from .scheduling import extract_multi_subject_syllabus

        if request.user.role == 'KID':
            return Response({"error": "Kids cannot upload syllabuses."}, status=status.HTTP_403_FORBIDDEN)

        if 'file' not in request.FILES:
            return Response({"error": "No file uploaded."}, status=status.HTTP_400_BAD_REQUEST)

        file_obj = request.FILES['file']
        difficulty = request.data.get('difficulty', 'Medium')

        # Difficulty multiplier
        mult = {'hard': 1.25, 'easy': 0.75}.get(difficulty.lower(), 1.0)

        # Save temp file
        with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
            for chunk in file_obj.chunks():
                tmp.write(chunk)
            tmp_path = tmp.name

        try:
            parser = LlamaParse(result_type="markdown")
            documents = parser.load_data(tmp_path)
            full_text = "\n\n".join([doc.text for doc in documents])

            subjects_data = extract_multi_subject_syllabus(full_text)

            if not subjects_data:
                return Response({"error": "Could not extract any subjects from the PDF."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

            target_user = self.get_target_user(request)
            created_subjects = []

            for subj_data in subjects_data:
                subject_name = subj_data.get('subject_name', 'Unknown Subject').strip()
                if not subject_name:
                    continue

                total_hours = int(subj_data.get('total_course_hours') or 40)
                modules = subj_data.get('modules', [])
                num_modules = max(len(modules), 1)
                base_module_time = (total_hours / num_modules) * mult

                subject = Subject.objects.create(
                    user=target_user,
                    name=subject_name,
                    target_exam_date=None,
                    difficulty=difficulty,
                )

                for mod_data in modules:
                    module = Module.objects.create(
                        subject=subject,
                        title=mod_data.get('title', 'Module'),
                        order_index=mod_data.get('order_index', 0),
                    )
                    topics = mod_data.get('topics', [])
                    num_topics = max(len(topics), 1)
                    hours_per_topic = base_module_time / num_topics

                    for top_data in topics:
                        Topic.objects.create(
                            module=module,
                            name=top_data.get('name', 'Topic'),
                            estimated_hours=hours_per_topic,
                            order_index=top_data.get('order_index', 0),
                        )

                created_subjects.append({
                    "id": subject.id,
                    "name": subject.name,
                    "modules_count": len(modules),
                })

            return Response({
                "detail": f"Successfully extracted {len(created_subjects)} subject(s).",
                "subjects": created_subjects,
            }, status=status.HTTP_201_CREATED)

        except Exception as e:
            import traceback
            traceback.print_exc()
            return Response({"error": "Multi-subject extraction failed", "details": str(e)}, status=400)
        finally:
            if os.path.exists(tmp_path):
                os.remove(tmp_path)


from django.db.models import F
from datetime import timedelta, date

class CarryOverSessionsView(ChildResolverMixin, views.APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        target_user = self.get_target_user(request)
        target_date = date.today()
        
        # STEP 1: Shift all existing tasks from the target date onwards forward by 1 day
        StudySession.objects.filter(
            user=target_user, 
            date__gte=target_date
        ).update(date=F('date') + timedelta(days=1))
        
        # STEP 2: Now safely move the overdue/missed tasks into the newly emptied target_date
        StudySession.objects.filter(
            user=target_user,
            date__lt=target_date,
            is_completed=False
        ).update(date=target_date)
        
        return Response({"detail": "Overdue sessions shifted successfully."}, status=status.HTTP_200_OK)

class CarryOverSingleSessionView(ChildResolverMixin, views.APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request, pk):
        target_user = self.get_target_user(request)
        try:
            session = StudySession.objects.get(id=pk, user=target_user)
        except StudySession.DoesNotExist:
            return Response({"error": "Session not found"}, status=status.HTTP_404_NOT_FOUND)
            
        new_date = session.date + timedelta(days=1)
        subject = session.topic.module.subject
        
        # Count how many pending blocks exist on tomorrow for this specific subject
        existing_blocks = StudySession.objects.filter(
            user=target_user,
            topic__module__subject=subject,
            date=new_date,
            is_completed=False
        ).count()
        
        # If tomorrow already has 3 or more blocks, pushing another one makes 4 (too much).
        # We must shift the original scheduled blocks to the day after tomorrow.
        if existing_blocks >= 3:
            StudySession.objects.filter(
                user=target_user,
                topic__module__subject=subject,
                date__gte=new_date,
                is_completed=False,
                id__gt=session.id # MAGIC FILTER: Only shifts blocks created AFTER this one (the future curriculum)
            ).update(date=F('date') + timedelta(days=1))
        
        # Safely move this session to tomorrow
        session.date = new_date
        session.save()
        
        return Response({"status": "Cascading shift successful"})

# Placeholder for Clear Schedule View
class ClearScheduleView(ChildResolverMixin, views.APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        target_user = self.get_target_user(request)
        StudySession.objects.filter(user=target_user).delete()
        Subject.objects.filter(user=target_user).delete()
        return Response({"detail": "Schedule cleared", "cleared": 0}, status=status.HTTP_200_OK)

# Placeholder for AI Rebuild View
class AIRebuildScheduleView(views.APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        return Response({"detail": "Not implemented yet - Waiting for Phase 3"}, status=status.HTTP_200_OK)
class AIAssistantView(ChildResolverMixin, views.APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        from chatbot.rag_engine import ask_focuspath
        from datetime import datetime, timedelta, date
        from planner.models import Subject, Module, Topic, StudySession
        from focus.models import FocusSession
        from users.models import User, ParentChildRelation, UserRoutine
        
        query = request.data.get('query', '')
        mode = request.data.get('mode', 'GENERAL').upper()
        chat_history = request.data.get('chat_history', [])
        
        target_user = self.get_target_user(request)
        today = date.today()
        
        # 1. User & Account Profile
        user_summary = f"Logged in User: {request.user.username} (Role: {request.user.role})"
        if target_user != request.user:
            user_summary += f" | Viewing Child Student: {target_user.username} (Role: {target_user.role})"
        if target_user.role == User.Roles.KID:
            user_summary += f" | Grade/Age: {target_user.grade_level or target_user.age_group or 'Not specified'}"

        # 2. Enrolled Subjects, Modules & Topics (Curriculum on the website)
        subjects_qs = Subject.objects.filter(user=target_user).prefetch_related('modules__topics')
        if not subjects_qs.exists() and request.user.role == User.Roles.PARENT:
            subjects_qs = Subject.objects.filter(user__parent_relations__parent=request.user).prefetch_related('modules__topics')
            
        curriculum_text = ""
        if subjects_qs.exists():
            curriculum_text = "CURRENT SUBJECTS & TOPICS ON PLATFORM:\n"
            for sub in subjects_qs:
                curriculum_text += f"• Subject: {sub.name} (Difficulty: {sub.difficulty}, Plan: {sub.plan_type}, Target: {sub.daily_subject_hours}h/day)\n"
                for mod in sub.modules.all():
                    topics_strs = [f"{t.name} [{'✓ Completed' if t.is_completed else 'Pending'}, {t.estimated_hours}h]" for t in mod.topics.all()]
                    curriculum_text += f"  - {mod.title}: {', '.join(topics_strs) if topics_strs else 'No topics'}\n"
        else:
            curriculum_text = "CURRENT SUBJECTS: No custom subjects created in the database yet.\n"

        # 3. Live Study Sessions & Schedule
        all_sessions = StudySession.objects.filter(user=target_user).select_related('topic__module__subject').order_by('date', 'start_time')
        total_sessions = all_sessions.count()
        completed_sessions = all_sessions.filter(is_completed=True).count()
        completion_rate = int((completed_sessions / total_sessions * 100)) if total_sessions > 0 else 0
        
        upcoming_sessions = all_sessions.filter(is_completed=False, date__gte=today)
        
        schedule_text = f"LIVE SCHEDULE & TIMETABLE (Today is {today.strftime('%A, %B %d, %Y')}):\n"
        schedule_text += f"- Total Study Sessions: {total_sessions} ({completed_sessions} completed, {completion_rate}% completion rate)\n"
        if upcoming_sessions.exists():
            schedule_text += "Upcoming Pending Sessions:\n"
            for s in upcoming_sessions[:10]:
                sub_name = s.topic.module.subject.name if s.topic and s.topic.module else "Custom"
                top_name = s.topic.name if s.topic else "Custom Topic"
                st = s.start_time.strftime('%H:%M') if s.start_time else "TBD"
                et = s.end_time.strftime('%H:%M') if s.end_time else "TBD"
                date_formatted = s.date.strftime('%A, %B %d, %Y') if hasattr(s.date, 'strftime') else str(s.date)
                schedule_text += f"  • [{date_formatted}] {sub_name}: {top_name} ({st} - {et})\n"
        elif all_sessions.exists():
            schedule_text += f"- User has {total_sessions} sessions on record (all currently completed or from earlier dates).\n"
        else:
            schedule_text += "- No study sessions currently scheduled in the timetable.\n"

        # 4. Focus & Distraction Statistics
        focus_qs = FocusSession.objects.filter(user=target_user)
        total_focus = focus_qs.count()
        avg_score = (sum(f.focus_score for f in focus_qs) // total_focus) if total_focus > 0 else 100
        total_switches = sum(f.tab_switch_count for f in focus_qs)
        focus_text = f"LIVE FOCUS STATS: Average Focus Score: {avg_score}%, Total Focus Sessions: {total_focus}, Total Tab Distractions: {total_switches}.\n"
        
        # 5. Routine Info
        routine = getattr(target_user, 'routine', None)
        routine_text = ""
        if routine:
            routine_text = f"USER PREFERRED ROUTINE WINDOWS (General availability, NOT specific session times): Target: {routine.default_daily_hours}h/day"
            if routine.morning_study_start and routine.morning_study_end:
                routine_text += f", Morning Window: {routine.morning_study_start.strftime('%H:%M')}-{routine.morning_study_end.strftime('%H:%M')}"
            if routine.evening_study_start and routine.evening_study_end:
                routine_text += f", Evening Window: {routine.evening_study_start.strftime('%H:%M')}-{routine.evening_study_end.strftime('%H:%M')}"
            routine_text += "\n"

        # 6. Parent Family Overview (if parent)
        family_text = ""
        if request.user.role == User.Roles.PARENT:
            children_relations = ParentChildRelation.objects.filter(parent=request.user).select_related('child')
            if children_relations.exists():
                family_text = "FAMILY OVERVIEW (Children managed by this parent):\n"
                for rel in children_relations:
                    ch = rel.child
                    family_text += f"• Child: {ch.username} (Locked: {ch.is_locked}, PIN: {ch.kid_pin_plain or 'Not set'})\n"

        live_data_summary = f"{user_summary}\n\n{curriculum_text}\n\n{schedule_text}\n\n{focus_text}\n\n{routine_text}\n\n{family_text}".strip()

        dynamic_context = {
            'user_summary': user_summary,
            'curriculum_context': curriculum_text,
            'schedule_context': schedule_text,
            'focus_context': focus_text,
            'routine_text': routine_text,
            'family_text': family_text,
            'live_schedule': live_data_summary,
            'tasks': [f"{s.topic.name if s.topic else 'Session'} on {s.date.strftime('%A, %B %d, %Y') if hasattr(s.date, 'strftime') else s.date}" for s in all_sessions[:10]],
            'progress': completion_rate
        }
            
        try:
            chat, response = ask_focuspath(query, chat_history, mode, dynamic_context)
            reply_text = None
            action = None
            
            # Handle Gemini Function Calls
            if hasattr(response, 'parts') and getattr(response, 'parts', None):
                part = response.parts[0]
                if hasattr(part, 'function_call') and part.function_call:
                    fc = part.function_call
                    if fc.name == 'create_study_block':
                        args = fc.args
                        subject_name = args.get('subject_name')
                        date_str = args.get('date')
                        start_time_str = args.get('start_time')
                        duration_minutes = args.get('duration_minutes', 60)
                        
                        try:
                            # 1. Find or create subject
                            subject = Subject.objects.filter(user=target_user, name__icontains=subject_name).first()
                            if not subject:
                                subject = Subject.objects.create(
                                    user=target_user,
                                    name=subject_name,
                                    daily_subject_hours=1.0,
                                    plan_type='Study',
                                    difficulty='Medium',
                                    color_code='#4F46E5'
                                )
                                
                            # 2. Strict date/time parsing with robust error handling
                            if len(start_time_str) > 5:
                                start_time_str = start_time_str[:5]
                            
                            start_time = datetime.strptime(start_time_str, '%H:%M').time()
                            dt_start = datetime.combine(datetime.strptime(date_str, '%Y-%m-%d'), start_time)
                            dt_end = dt_start + timedelta(minutes=int(duration_minutes))
                            
                            # 3. Find or create module and topic
                            module, _ = Module.objects.get_or_create(
                                subject=subject, 
                                title="Custom Blocks",
                                defaults={'order_index': 999}
                            )
                            topic_name = f"{subject_name} Study Block"
                            topic, _ = Topic.objects.get_or_create(
                                module=module, 
                                name=topic_name, 
                                defaults={'estimated_hours': float(duration_minutes) / 60.0}
                            )
                            
                            StudySession.objects.create(
                                user=target_user,
                                topic=topic,
                                date=date_str,
                                start_time=start_time,
                                end_time=dt_end.time()
                            )
                            
                            reply_text = f"✅ Scheduled **{subject.name}** for **{date_str}** from **{start_time_str}** to **{dt_end.strftime('%H:%M')}** ({duration_minutes} mins)! Your timetable has been refreshed."
                            action = "REFRESH_PLANNER"
                        except ValueError as ve:
                            reply_text = f"⚠️ Could not schedule block due to date/time format error: {str(ve)}. Please provide dates as YYYY-MM-DD and time as HH:MM."
                        except Exception as e:
                            reply_text = f"⚠️ Internal error creating study block: {str(e)}"
            
            if not reply_text:
                try:
                    reply_text = response.text
                except (ValueError, AttributeError):
                    reply_text = "I'm sorry, I couldn't formulate a text response. Please ask me directly or provide more details!"
                
            res_data = {"reply": reply_text}
            if action:
                res_data["action"] = action
                
            return Response(res_data)
        except Exception as e:
            error_str = str(e).lower()
            if "429" in error_str or "quota" in error_str or "exhausted" in error_str:
                return Response({
                    "error": "rate_limit", 
                    "message": "The AI is currently resting. Please try again later.", 
                    "detail": "API key exhausted or rate limit finished."
                }, status=429)
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
