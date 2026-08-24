from django.utils import timezone
from django.utils.dateparse import parse_date
from rest_framework import generics, status, views
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied
from planner.models import Task
from planner.serializers import TaskSerializer
from planner.scheduling import generate_schedule, parse_syllabus_text, clamp_to_window
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
        # start from the next hour, but only inside the daytime study window (no 1-5 AM slots)
        current_pointer = clamp_to_window(now + timezone.timedelta(hours=1))

        for task in missed_tasks:
            duration = task.end_time - task.start_time
            new_start = clamp_to_window(current_pointer)
            new_end = new_start + duration

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

            # next slot: 30-min break, then re-clamp into the study window for the following task
            current_pointer = clamp_to_window(new_end + timezone.timedelta(minutes=30))

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
        return Response({'subjects': parse_syllabus_text(text)}, status=status.HTTP_200_OK)


class SyllabusUploadView(views.APIView):
    # Accept a .txt or .pdf upload and extract subjects. Text files are decoded directly;
    # PDFs are parsed with pypdf (install on the server: pip install pypdf).
    permission_classes = [IsAuthenticated]

    def post(self, request):
        f = request.FILES.get('file')
        if not f:
            return Response({'detail': 'No file provided.'}, status=status.HTTP_400_BAD_REQUEST)
        name = (f.name or '').lower()
        if name.endswith('.pdf'):
            try:
                from pypdf import PdfReader
            except ImportError:
                return Response(
                    {'detail': 'PDF support is not installed on the server. Run: pip install pypdf'},
                    status=status.HTTP_501_NOT_IMPLEMENTED,
                )
            try:
                reader = PdfReader(f)
                text = '\n'.join((page.extract_text() or '') for page in reader.pages)
            except Exception:
                return Response({'detail': 'Could not read the PDF file.'}, status=status.HTTP_400_BAD_REQUEST)
        else:
            try:
                text = f.read().decode('utf-8', errors='ignore')
            except Exception:
                return Response({'detail': 'Could not read the file.'}, status=status.HTTP_400_BAD_REQUEST)
        return Response({'subjects': parse_syllabus_text(text)}, status=status.HTTP_200_OK)


class GenerateScheduleView(views.APIView):
    # Build a fresh timetable from subjects + finish-by date + hours/day.
    # Archives any existing active plan first, then creates the new Task blocks.
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        if user.role == User.Roles.KID:
            raise PermissionDenied("Kids do not create timetables.")

        subjects = request.data.get('subjects', [])
        try:
            daily_hours = int(request.data.get('daily_hours', 4) or 4)
        except (TypeError, ValueError):
            daily_hours = 4
        finish_by = parse_date(str(request.data.get('finish_by', '')))

        if not subjects or not finish_by:
            return Response({"detail": "subjects and finish_by (YYYY-MM-DD) are required."},
                            status=status.HTTP_400_BAD_REQUEST)

        now = timezone.localtime(timezone.now())
        # replace any existing active/updated plan so regeneration is clean
        Task.objects.filter(
            user=user, status__in=[Task.Statuses.ACTIVE, Task.Statuses.UPDATED]
        ).update(status=Task.Statuses.ARCHIVED)

        planned = generate_schedule(subjects, daily_hours, finish_by, now)
        created = [Task.objects.create(user=user, status=Task.Statuses.ACTIVE, **t) for t in planned]
        return Response(TaskSerializer(created, many=True).data, status=status.HTTP_201_CREATED)


class ClearScheduleView(views.APIView):
    # Delete the syllabus plan: archive every active/updated task so the timetable is emptied.
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        if user.role == User.Roles.KID:
            raise PermissionDenied("Kids do not manage timetables.")
        cleared = Task.objects.filter(
            user=user, status__in=[Task.Statuses.ACTIVE, Task.Statuses.UPDATED]
        ).update(status=Task.Statuses.ARCHIVED)
        return Response({"detail": "Syllabus plan cleared.", "cleared": cleared}, status=status.HTTP_200_OK)


class CarryOverView(views.APIView):
    # Spread overdue (past, still-active) study blocks into upcoming free slots, respecting each
    # task's deadline and the daytime window. This is the "adjust my timetable" action.
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        if user.role == User.Roles.KID:
            raise PermissionDenied("Kids do not manage timetables.")
        now = timezone.localtime(timezone.now())

        overdue = list(Task.objects.filter(
            user=user, status__in=[Task.Statuses.ACTIVE, Task.Statuses.UPDATED], end_time__lt=now
        ).order_by('deadline', 'start_time'))
        if not overdue:
            return Response({"detail": "No overdue blocks to carry over.", "moved": 0}, status=status.HTTP_200_OK)

        cursor = clamp_to_window(now + timezone.timedelta(hours=1))
        moved = 0
        for task in overdue:
            duration = task.end_time - task.start_time
            start = clamp_to_window(cursor)
            task.start_time = start
            task.end_time = start + duration
            task.status = Task.Statuses.UPDATED  # marks it as a rescheduled/carried block
            task.save(update_fields=['start_time', 'end_time', 'status'])
            moved += 1
            cursor = clamp_to_window(task.end_time + timezone.timedelta(minutes=15))
        return Response({"detail": "Overdue blocks carried over.", "moved": moved}, status=status.HTTP_200_OK)


class PlannerAssistantView(views.APIView):
    # Rule-based Timetable Planner assistant: answers from the user's REAL tasks so replies
    # always match the stored timetable (no external LLM; deterministic + explainable).
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        msg = str(request.data.get('message', '') or '').lower().strip()
        tab = str(request.data.get('tab', 'planner') or 'planner').lower()
        now = timezone.localtime(timezone.now())

        active = Task.objects.filter(
            user=user, status__in=[Task.Statuses.ACTIVE, Task.Statuses.UPDATED]
        ).order_by('start_time')
        pending = [t for t in active if t.status != Task.Statuses.COMPLETED]
        total = active.count()
        completed = Task.objects.filter(user=user, status=Task.Statuses.COMPLETED).count()

        def fmt(dt):
            return timezone.localtime(dt).strftime('%a %d %b, %I:%M %p')

        # --- Syllabus tab: answer content questions from the user's real subjects + topics ---
        if tab == 'syllabus':
            all_tasks = list(Task.objects.filter(user=user).exclude(status=Task.Statuses.ARCHIVED))
            subjects = []
            topics_by_subject = {}
            for t in all_tasks:
                if t.title not in topics_by_subject:
                    topics_by_subject[t.title] = []
                    subjects.append(t.title)
                topic = (t.description or '').strip()
                if topic and topic.lower() != 'focused study session' and topic not in topics_by_subject[t.title]:
                    topics_by_subject[t.title].append(topic)
            if not subjects:
                return Response({"reply": "Your syllabus is empty. Upload a syllabus and generate a plan, then I can tell you what topics it covers."}, status=status.HTTP_200_OK)
            # topics for a named subject the user mentioned
            for s in subjects:
                if s.lower() in msg:
                    tops = topics_by_subject.get(s) or []
                    if tops:
                        return Response({"reply": f"{s} covers: {', '.join(tops)}."}, status=status.HTTP_200_OK)
                    return Response({"reply": f"{s} is in your plan, but no specific topics were listed in the syllabus. Add topics like 'Data Structures: Arrays, Trees' for a per-topic breakdown."}, status=status.HTTP_200_OK)
            if any(k in msg for k in ['subject', 'what', 'list', 'cover', 'topic', 'syllabus']):
                return Response({"reply": f"Your syllabus has {len(subjects)} subject(s): {', '.join(subjects)}. Ask about any one of them to see its topics."}, status=status.HTTP_200_OK)
            return Response({"reply": f"I can break down your syllabus. You have: {', '.join(subjects)}. Ask 'What topics are in <subject>?'"}, status=status.HTTP_200_OK)

        # what should I study next / today
        if any(k in msg for k in ['next', 'today', 'now', 'what should', 'study']):
            upcoming = active.filter(start_time__gte=now).first() or (pending[0] if pending else None)
            if upcoming:
                reply = f"Study next: {upcoming.title} at {fmt(upcoming.start_time)}."
            else:
                reply = "You have no upcoming study blocks. Upload a syllabus and generate a plan to get started."
        # workload / how much
        elif any(k in msg for k in ['workload', 'how much', 'how many', 'remaining', 'left', 'pending']):
            mins = sum(int((t.end_time - t.start_time).total_seconds() // 60) for t in pending)
            reply = f"You have {len(pending)} study block(s) remaining, about {round(mins / 60, 1)} hours of work."
        # progress
        elif any(k in msg for k in ['progress', 'done', 'complete', 'finished']):
            pct = round((completed / (total + completed) * 100)) if (total + completed) else 0
            reply = f"Progress: {completed} block(s) completed, {total} still active ({pct}% done)."
        else:
            reply = ("I'm your Timetable Planner. Ask me 'What should I study next?', "
                     "'How much workload is left?', or 'What's my progress?'")
        return Response({"reply": reply}, status=status.HTTP_200_OK)
