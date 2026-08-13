from django.utils import timezone
from rest_framework import generics, status, views
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied
from planner.models import Task
from planner.serializers import TaskSerializer
from users.models import User

class TaskListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = TaskSerializer

    def get_queryset(self):
        # Return tasks belonging to the user
        return Task.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        user = self.request.user
        if user.role == User.Roles.KID:
            raise PermissionDenied("Kids are not allowed to create tasks or timetables.")
        serializer.save(user=user)

class TaskRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = TaskSerializer

    def get_queryset(self):
        return Task.objects.filter(user=self.request.user)

    def perform_update(self, serializer):
        user = self.request.user
        if user.role == User.Roles.KID:
            raise PermissionDenied("Kids are not allowed to update tasks or timetables.")
        serializer.save()

    def destroy(self, request, *args, **kwargs):
        user = request.user
        if user.role == User.Roles.KID:
            raise PermissionDenied("Kids are not allowed to delete or archive tasks.")
        
        instance = self.get_object()
        # Soft delete instead of hard delete
        instance.delete()
        return Response(
            {"detail": "Task successfully soft-deleted (archived).", "status": instance.status},
            status=status.HTTP_200_OK
        )

class AIRebuildScheduleView(views.APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        if user.role == User.Roles.KID:
            raise PermissionDenied("Kids cannot trigger AI schedule rebuilding.")

        now = timezone.now()
        
        # Step 1: Detect incomplete tasks that have started or passed
        missed_tasks = Task.objects.filter(
            user=user,
            status=Task.Statuses.ACTIVE,
            start_time__lt=now
        ).order_by('priority', 'deadline')

        if not missed_tasks.exists():
            return Response({"detail": "No missed tasks detected. Schedule is up to date!"}, status=status.HTTP_200_OK)

        # Step 2: Find free slots & Step 3-6: Calculate scheduling priorities
        # For simplicity, we will push missed tasks forward starting from the next hour,
        # checking if we can fit them before their deadlines.
        rebuilt_plans = []
        current_pointer = now + timezone.timedelta(hours=1)
        
        for task in missed_tasks:
            duration = task.end_time - task.start_time
            new_start = current_pointer
            new_end = current_pointer + duration
            
            # Step 6: Ensure deadlines are still achievable
            achievable = new_end <= task.deadline
            
            rebuilt_plans.append({
                "task_id": task.id,
                "title": task.title,
                "original_start": task.start_time,
                "original_end": task.end_time,
                "proposed_start": new_start,
                "proposed_end": new_end,
                "deadline": task.deadline,
                "achievable": achievable
            })
            
            # Increment current pointer for the next task slot
            current_pointer = new_end + timezone.timedelta(minutes=30) # 30 min break between tasks

        # Store proposed plan in session for temporary approval flow (Step 7)
        request.session['proposed_rebuilt_plan'] = [
            {
                "task_id": p["task_id"],
                "proposed_start": p["proposed_start"].isoformat(),
                "proposed_end": p["proposed_end"].isoformat()
            } for p in rebuilt_plans if p["achievable"]
        ]

        return Response({
            "detail": "AI schedule rebuild completed successfully.",
            "rebuilt_tasks": rebuilt_plans
        }, status=status.HTTP_200_OK)

class AIAcceptRebuiltView(views.APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        # Step 8: Allow user acceptance. Prefer the plan sent in the request body
        # (works for token-auth SPAs); fall back to the session copy if not provided.
        plan = request.data.get('plan') or request.session.get('proposed_rebuilt_plan', [])
        if not plan:
            return Response({"detail": "No rebuilt plan found to accept."}, status=status.HTTP_400_BAD_REQUEST)

        updated_tasks = []
        for item in plan:
            try:
                task = Task.objects.get(id=item["task_id"], user=request.user)
                task.start_time = timezone.datetime.fromisoformat(item["proposed_start"])
                task.end_time = timezone.datetime.fromisoformat(item["proposed_end"])
                task.status = Task.Statuses.UPDATED
                task.save()
                updated_tasks.append(TaskSerializer(task).data)
            except Task.DoesNotExist:
                continue

        # Clean up session
        del request.session['proposed_rebuilt_plan']
        
        return Response({
            "detail": "Adaptive schedule accepted and updated successfully.",
            "tasks": updated_tasks
        }, status=status.HTTP_200_OK)


class SyllabusParseView(views.APIView):
    # Lightweight, honest syllabus helper: turns pasted syllabus TEXT into a list of
    # subject names (one per line). This is text parsing, not image OCR.
    permission_classes = [IsAuthenticated]

    def post(self, request):
        text = request.data.get('text', '') or ''
        seen = set()
        subjects = []
        for line in text.splitlines():
            name = line.strip(' -*•\t')          # trim bullets/dashes/spaces
            name = name.split(':')[0].split(' - ')[0].strip()  # keep the part before a colon/dash
            if len(name) < 2:
                continue
            key = name.lower()
            if key in seen:
                continue
            seen.add(key)
            subjects.append({'name': name[:120]})
        return Response({'subjects': subjects[:30]}, status=status.HTTP_200_OK)
