from django.utils import timezone
from rest_framework import generics, status, views
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied
from rest_framework.parsers import MultiPartParser, FormParser
import tempfile
import os
from .models import Subject, Module, Topic, StudySession
from .serializers import SubjectSerializer, ModuleSerializer, TopicSerializer, StudySessionSerializer
from .scheduling import extract_syllabus_to_json
from users.models import User

class SubjectListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = SubjectSerializer

    def get_queryset(self):
        return Subject.objects.filter(user=self.request.user).prefetch_related('modules__topics')

    def perform_create(self, serializer):
        user = self.request.user
        if user.role == User.Roles.KID:
            raise PermissionDenied("Kids are not allowed to create subjects.")
        serializer.save(user=user)

class SubjectRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = SubjectSerializer

    def get_queryset(self):
        return Subject.objects.filter(user=self.request.user).prefetch_related('modules__topics')


class StudySessionListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = StudySessionSerializer

    def get_queryset(self):
        return StudySession.objects.filter(user=self.request.user).select_related('topic__module__subject')

    def perform_create(self, serializer):
        user = self.request.user
        if user.role == User.Roles.KID:
            raise PermissionDenied("Kids are not allowed to create sessions manually.")
        serializer.save(user=user)

class StudySessionRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = StudySessionSerializer

    def get_queryset(self):
        return StudySession.objects.filter(user=self.request.user).select_related('topic__module__subject')

import datetime
from .services import generate_timetable

class GenerateScheduleView(views.APIView):
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
            
            subject = Subject.objects.get(id=subject_id, user=request.user)
            if target_date_str:
                subject.target_exam_date = datetime.datetime.strptime(target_date_str, '%Y-%m-%d').date()
            if 'plan_type' in request.data:
                subject.plan_type = request.data['plan_type']
            if 'difficulty' in request.data:
                subject.difficulty = request.data['difficulty']
            if 'daily_subject_hours' in request.data:
                subject.daily_subject_hours = int(request.data['daily_subject_hours'])
            subject.save()
            
            user_routine = UserRoutine.objects.filter(user=request.user).first()
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
            
            generate_timetable(request.user, subject_id, start_date, parsed_routine, daily_hours, weekend_warrior)
            
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

class SyllabusUploadView(views.APIView):
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
            # Parse PDF to markdown (imported here, not at module load, so the rest of the
            # planner app still works even if this optional dependency isn't installed)
            from llama_parse import LlamaParse
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
            
            subject = Subject.objects.create(
                user=user,
                name=subject_name,
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
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        finally:
            if os.path.exists(tmp_path):
                os.remove(tmp_path)

# Placeholder for Clear Schedule View
class ClearScheduleView(views.APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        StudySession.objects.filter(user=request.user).delete()
        Subject.objects.filter(user=request.user).delete()
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
        query = request.data.get('query', '')
        mode = request.data.get('mode', 'GENERAL').upper()
        chat_history = request.data.get('chat_history', [])
        
        dynamic_context = {}
        if mode == 'PLANNER':
            sessions = StudySession.objects.filter(user=request.user, is_completed=False)[:10]
            dynamic_context['tasks'] = [f"{s.topic.name if s.topic else 'Session'} on {s.date}" for s in sessions]
            
        try:
            reply = ask_focuspath(query, chat_history, mode, dynamic_context)
            return Response({"reply": reply})
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
