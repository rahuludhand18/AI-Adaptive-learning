from django.utils import timezone
from rest_framework import status, views
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from focus.models import FocusSession, TabActivityEvent
from focus.serializers import FocusSessionSerializer
from users.models import User, ParentChildRelation

class StartFocusSessionView(views.APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        # End all previous active focus sessions
        FocusSession.objects.filter(user=user, is_active=True).update(
            is_active=False,
            end_time=timezone.now()
        )
        
        session = FocusSession.objects.create(user=user, is_active=True)
        serializer = FocusSessionSerializer(session)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

class EndFocusSessionView(views.APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        try:
            session = FocusSession.objects.get(user=user, is_active=True)
        except FocusSession.DoesNotExist:
            return Response({"detail": "No active focus session found."}, status=status.HTTP_404_NOT_FOUND)

        session.end_time = timezone.now()
        session.is_active = False
        session.calculate_score()
        session.save()
        
        serializer = FocusSessionSerializer(session)
        return Response(serializer.data, status=status.HTTP_200_OK)

class TabSwitchView(views.APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        user.tab_switch_count += 1
        user.save()

        # Update active focus session if exists
        active_session = FocusSession.objects.filter(user=user, is_active=True).first()
        if active_session:
            active_session.tab_switch_count += 1
            active_session.calculate_score()
            active_session.save()

        response_data = {
            "tab_switch_count": user.tab_switch_count,
            "logout_required": False,
            "locked": False
        }

        # Check rules for KID mode
        if user.role == User.Roles.KID:
            if user.tab_switch_count >= 3:
                user.is_locked = True
                user.save()

                # Create an approval request for the parent
                # Find linked parents
                relations = ParentChildRelation.objects.filter(child=user)
                parent = relations.first().parent if relations.exists() else None

                # Lazy import ApprovalRequest to avoid circular dependency
                from parents.models import ApprovalRequest
                ApprovalRequest.objects.create(
                    child=user,
                    parent=parent,
                    reason="Locked out due to 3 tab switches.",
                    status=ApprovalRequest.ApprovalStatus.PENDING
                )

                response_data["logout_required"] = True
                response_data["locked"] = True
                response_data["code"] = "account_locked"  # frontend tab-tracker checks this
                response_data["detail"] = "Account locked due to 3 tab switches. Parent approval needed."
                return Response(response_data, status=status.HTTP_403_FORBIDDEN)

        # For Adult mode, we just return the count. No lockouts.
        return Response(response_data, status=status.HTTP_200_OK)


class TabActivityLogView(views.APIView):
    # Lightweight left/return event log, separate from the lockout counter above — this is
    # purely so a parent can see exactly when their child left the app and for how long.
    permission_classes = [IsAuthenticated]

    def post(self, request):
        event_type = str(request.data.get('event_type', '')).upper()
        if event_type not in (TabActivityEvent.EventType.LEFT, TabActivityEvent.EventType.RETURN):
            return Response({"detail": "event_type must be LEFT or RETURN."}, status=status.HTTP_400_BAD_REQUEST)
        TabActivityEvent.objects.create(user=request.user, event_type=event_type)
        return Response({"detail": "Logged."}, status=status.HTTP_201_CREATED)
