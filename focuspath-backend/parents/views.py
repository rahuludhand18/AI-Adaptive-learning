from rest_framework import generics, status, views
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, BasePermission
from django.utils import timezone
from datetime import timedelta
from parents.models import Restriction, ApprovalRequest
from parents.serializers import RestrictionSerializer, ApprovalRequestSerializer, ResolveApprovalSerializer
from users.models import User, ParentChildRelation
from users.serializers import KidCreateSerializer, UserSerializer
from focus.models import TabActivityEvent
from authentication.models import LoginEvent

class IsParentUser(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == User.Roles.PARENT

class ParentApprovalListView(generics.ListAPIView):
    permission_classes = [IsParentUser]
    serializer_class = ApprovalRequestSerializer

    def get_queryset(self):
        parent = self.request.user
        # Find child users linked to this parent
        child_ids = ParentChildRelation.objects.filter(parent=parent).values_list('child_id', flat=True)
        return ApprovalRequest.objects.filter(child_id__in=child_ids, status=ApprovalRequest.ApprovalStatus.PENDING)

class ParentApprovalResolveView(views.APIView):
    permission_classes = [IsParentUser]

    def post(self, request, pk):
        try:
            req = ApprovalRequest.objects.get(pk=pk)
        except ApprovalRequest.DoesNotExist:
            return Response({"detail": "Approval request not found."}, status=status.HTTP_404_NOT_FOUND)

        # Check if child is linked to this parent
        parent = request.user
        if not ParentChildRelation.objects.filter(parent=parent, child=req.child).exists():
            return Response({"detail": "Not authorized to resolve this request."}, status=status.HTTP_403_FORBIDDEN)

        serializer = ResolveApprovalSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        action = serializer.validated_data['action']
        duration = serializer.validated_data['duration']

        req.status = action
        req.resolved_at = timezone.now()
        req.parent = parent
        req.save()

        child = req.child
        if action == 'APPROVED':
            child.is_locked = False
            child.temporary_session_until = timezone.now() + timedelta(minutes=duration)
            child.tab_switch_count = 0
            child.save()

        return Response({"detail": f"Request resolved as {action}."}, status=status.HTTP_200_OK)

class ParentKidsView(generics.ListCreateAPIView):
    permission_classes = [IsParentUser]

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return KidCreateSerializer
        return UserSerializer

    def get_queryset(self):
        parent = self.request.user
        child_ids = ParentChildRelation.objects.filter(parent=parent).values_list('child_id', flat=True)
        return User.objects.filter(id__in=child_ids)

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

class RestrictionDetailView(views.APIView):
    permission_classes = [IsParentUser]

    def get_object(self, child_id):
        # Verify ownership
        parent = self.request.user
        if not ParentChildRelation.objects.filter(parent=parent, child_id=child_id).exists():
            raise PermissionError("Not authorized to manage this child's restrictions.")
        
        restriction, created = Restriction.objects.get_or_create(child_id=child_id)
        return restriction

    def get(self, request, child_id):
        try:
            obj = self.get_object(child_id)
            serializer = RestrictionSerializer(obj)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except PermissionError as e:
            return Response({"detail": str(e)}, status=status.HTTP_403_FORBIDDEN)

    def put(self, request, child_id):
        try:
            obj = self.get_object(child_id)
            serializer = RestrictionSerializer(obj, data=request.data, partial=True)
            serializer.is_valid(raise_exception=True)
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        except PermissionError as e:
            return Response({"detail": str(e)}, status=status.HTTP_403_FORBIDDEN)


class ChildActivityView(views.APIView):
    # Shows a parent exactly when their child left FocusPath and for how long, plus a
    # today/this-week switch count — built from the paired LEFT/RETURN event log.
    permission_classes = [IsParentUser]

    def get(self, request, child_id):
        parent = request.user
        if not ParentChildRelation.objects.filter(parent=parent, child_id=child_id).exists():
            return Response({"detail": "Not authorized to view this child's activity."}, status=status.HTTP_403_FORBIDDEN)

        since = timezone.now() - timedelta(days=7)
        events = list(TabActivityEvent.objects.filter(user_id=child_id, occurred_at__gte=since).order_by('occurred_at'))

        # pair each LEFT with the next RETURN into a readable "away" interval
        today = timezone.localtime(timezone.now()).date()
        sessions = []
        today_count = 0
        pending_left = None
        for e in events:
            if e.event_type == TabActivityEvent.EventType.LEFT:
                pending_left = e.occurred_at
            elif e.event_type == TabActivityEvent.EventType.RETURN and pending_left:
                away_seconds = int((e.occurred_at - pending_left).total_seconds())
                sessions.append({
                    "left_at": pending_left.isoformat(),
                    "returned_at": e.occurred_at.isoformat(),
                    "away_seconds": away_seconds,
                })
                if timezone.localtime(pending_left).date() == today:
                    today_count += 1
                pending_left = None
        # still away right now (a LEFT with no matching RETURN yet)
        still_away = pending_left.isoformat() if pending_left else None

        # pair LOGIN with the next LOGOUT the same way, so a parent sees every sign-in/out
        login_events = list(LoginEvent.objects.filter(user_id=child_id, occurred_at__gte=since).order_by('occurred_at'))
        login_sessions = []
        pending_login = None
        for e in login_events:
            if e.event_type == LoginEvent.EventType.LOGIN:
                pending_login = e.occurred_at
            elif e.event_type == LoginEvent.EventType.LOGOUT and pending_login:
                login_sessions.append({
                    "login_at": pending_login.isoformat(),
                    "logout_at": e.occurred_at.isoformat(),
                    "duration_seconds": int((e.occurred_at - pending_login).total_seconds()),
                })
                pending_login = None
        still_logged_in_since = pending_login.isoformat() if pending_login else None

        return Response({
            "child_id": child_id,
            "still_away_since": still_away,
            "switches_today": today_count,
            "switches_last_7_days": len(sessions),
            "sessions": list(reversed(sessions))[:50],  # most recent first
            "still_logged_in_since": still_logged_in_since,
            "logins_last_7_days": len(login_sessions) + (1 if still_logged_in_since else 0),
            "login_sessions": list(reversed(login_sessions))[:50],
        }, status=status.HTTP_200_OK)
