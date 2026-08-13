from datetime import timedelta
from django.utils import timezone
from django.db.models import Avg
from rest_framework import views
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from planner.models import Task
from focus.models import FocusSession
from rewards.models import StarReward, ChildBadge
from users.models import User, ParentChildRelation


class AdultAnalyticsView(views.APIView):
    # Aggregate the signed-in adult's own tasks and focus sessions into dashboard numbers.
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        tasks = Task.objects.filter(user=user).exclude(status=Task.Statuses.ARCHIVED)
        total = tasks.count()
        completed = tasks.filter(status=Task.Statuses.COMPLETED).count()

        sessions = FocusSession.objects.filter(user=user, is_active=False)
        avg_focus = sessions.aggregate(a=Avg('focus_score'))['a'] or 0
        latest = sessions.order_by('-start_time').first()

        # focus score averaged per day for the last 7 days (for the trend chart)
        today = timezone.now().date()
        weekly = []
        for i in range(6, -1, -1):
            d = today - timedelta(days=i)
            day_avg = sessions.filter(start_time__date=d).aggregate(a=Avg('focus_score'))['a']
            weekly.append({'day': d.strftime('%a'), 'score': round(day_avg or 0)})

        # total study minutes from completed sessions
        total_minutes = 0
        for s in sessions:
            if s.end_time:
                total_minutes += (s.end_time - s.start_time).total_seconds() / 60

        return Response({
            'total_tasks': total,
            'completed_tasks': completed,
            'completion_rate': round(completed / total * 100) if total else 0,
            'avg_focus_score': round(avg_focus),
            'latest_focus_score': latest.focus_score if latest else 0,
            'total_study_minutes': round(total_minutes),
            'sessions': sessions.count(),
            'weekly_focus': weekly,
        })


class ParentAnalyticsView(views.APIView):
    # Per-child summary for the parent monitoring dashboard.
    permission_classes = [IsAuthenticated]

    def get(self, request):
        parent = request.user
        child_ids = ParentChildRelation.objects.filter(parent=parent).values_list('child_id', flat=True)

        children = []
        for child in User.objects.filter(id__in=child_ids):
            wallet = StarReward.objects.filter(child=child).first()
            sessions = FocusSession.objects.filter(user=child, is_active=False)
            avg_focus = sessions.aggregate(a=Avg('focus_score'))['a'] or 0
            study_minutes = 0
            for s in sessions:
                if s.end_time:
                    study_minutes += (s.end_time - s.start_time).total_seconds() / 60
            children.append({
                'id': child.id,
                'username': child.username,
                'is_locked': child.is_locked,
                'tab_switch_count': child.tab_switch_count,
                'stars': wallet.balance if wallet else 0,
                'streak': wallet.streak_count if wallet else 0,
                'badges': ChildBadge.objects.filter(child=child).count(),
                'sessions': sessions.count(),
                'avg_focus_score': round(avg_focus),
                'study_minutes': round(study_minutes),
            })

        return Response({'children': children})
