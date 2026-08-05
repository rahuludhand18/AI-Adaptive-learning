from rest_framework import generics, status, views
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, BasePermission
from django.utils import timezone
from datetime import timedelta
from parents.models import Restriction, ApprovalRequest
from parents.serializers import RestrictionSerializer, ApprovalRequestSerializer, ResolveApprovalSerializer
from users.models import User, ParentChildRelation
from users.serializers import KidCreateSerializer

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

class ParentAddKidView(generics.CreateAPIView):
    permission_classes = [IsParentUser]
    serializer_class = KidCreateSerializer

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
