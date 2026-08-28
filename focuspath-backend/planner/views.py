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
class AIAssistantView(views.APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        from chatbot.rag_engine import ask_focuspath
        from datetime import datetime, timedelta, date
        from planner.models import Subject, StudySession
        
        query = request.data.get('query', '')
        mode = request.data.get('mode', 'GENERAL').upper()
        chat_history = request.data.get('chat_history', [])
        
        # --- NEW LIVE CONTEXT LOGIC ---
        today = date.today()
        seven_days_later = today + timedelta(days=7)
        upcoming_sessions = StudySession.objects.filter(
            user=request.user, 
            date__gte=today,
            date__lte=seven_days_later,
            is_completed=False
        ).select_related('topic__module__subject').order_by('date', 'start_time')

        schedule_context = f"SYSTEM INSTRUCTION - LIVE USER DATA: Today's date is {today}. The user's upcoming pending schedule for the next 7 days is:\n"
        if upcoming_sessions.exists():
            for s in upcoming_sessions:
                subject = s.topic.module.subject.name if s.topic and s.topic.module else "Custom"
                topic = s.topic.name if s.topic else "Custom Topic"
                start = s.start_time.strftime('%H:%M') if s.start_time else "TBD"
                schedule_context += f"- [{s.date}] {subject}: {topic} at {start}\n"
        else:
            schedule_context += "- No tasks scheduled for the next 7 days. They are completely free!\n"

        dynamic_context = {'live_schedule': schedule_context}
        if mode == 'PLANNER':
            sessions = StudySession.objects.filter(user=request.user, is_completed=False)[:10]
            dynamic_context['tasks'] = [f"{s.topic.name if s.topic else 'Session'} on {s.date}" for s in sessions]
            
        try:
            chat, response = ask_focuspath(query, chat_history, mode, dynamic_context)
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
                            # 1. Handle missing subjects gracefully
                            subject = Subject.objects.filter(user=request.user, name__icontains=subject_name).first()
                            if not subject:
                                # Return error to LLM to let it know
                                response = chat.send_message(
                                    {"function_response": {
                                        "name": "create_study_block", 
                                        "response": {"status": "error", "message": f"Subject '{subject_name}' not found. Please ask user to create it first."}
                                    }}
                                )
                            else:
                                # 2. Strict date/time parsing with robust error handling
                                # Clean up potential HH:MM:SS from Gemini
                                if len(start_time_str) > 5:
                                    start_time_str = start_time_str[:5]
                                
                                start_time = datetime.strptime(start_time_str, '%H:%M').time()
                                dt_start = datetime.combine(datetime.strptime(date_str, '%Y-%m-%d'), start_time)
                                dt_end = dt_start + timedelta(minutes=int(duration_minutes))
                                
                                StudySession.objects.create(
                                    user=request.user,
                                    subject=subject,
                                    date=date_str,
                                    start_time=start_time,
                                    end_time=dt_end.time(),
                                    title=f"{subject.name} Study Block",
                                    plan_type='STUDY'
                                )
                                
                                # Return success to LLM
                                response = chat.send_message(
                                    {"function_response": {
                                        "name": "create_study_block", 
                                        "response": {"status": "success", "message": f"{subject.name} scheduled for {date_str} at {start_time_str}"}
                                    }}
                                )
                                action = "REFRESH_PLANNER"
                        except ValueError as ve:
                            # Catch date/time parsing errors
                            response = chat.send_message(
                                {"function_response": {
                                    "name": "create_study_block", 
                                    "response": {"status": "error", "message": f"Invalid date/time format. Please use YYYY-MM-DD and HH:MM. Error: {str(ve)}"}
                                }}
                            )
                        except Exception as e:
                            # Catch any other execution errors
                            response = chat.send_message(
                                {"function_response": {
                                    "name": "create_study_block", 
                                    "response": {"status": "error", "message": f"Internal execution error: {str(e)}"}
                                }}
                            )
            
            try:
                reply_text = response.text
            except ValueError:
                reply_text = "I'm sorry, I tried to perform an action but couldn't formulate a text response. Please ask me directly or provide more details!"
                
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
