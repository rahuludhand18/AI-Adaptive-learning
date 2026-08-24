from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated, BasePermission
from rest_framework.response import Response
from content.models import EducationLevel, Subject, Topic, Video
from content.serializers import (
    EducationLevelSerializer, SubjectSerializer, TopicSerializer, VideoSerializer,
    VideoCreateSerializer, MyVideoSerializer,
)
from users.models import User


# All content endpoints are read-only; adding/approving content happens in the Django
# admin so the child-facing catalog stays fully curated.

class LevelListView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = EducationLevelSerializer
    queryset = EducationLevel.objects.all()


class SubjectListView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = SubjectSerializer

    def get_queryset(self):
        qs = Subject.objects.all()
        level = self.request.query_params.get('level')  # ?level=<id>
        return qs.filter(level_id=level) if level else qs


class TopicListView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = TopicSerializer

    def get_queryset(self):
        qs = Topic.objects.all()
        subject = self.request.query_params.get('subject')  # ?subject=<id>
        return qs.filter(subject_id=subject) if subject else qs


class VideoListView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = VideoSerializer

    def get_queryset(self):
        qs = Video.objects.filter(is_approved=True)  # never expose unapproved videos to a child
        topic = self.request.query_params.get('topic')  # ?topic=<id>
        return qs.filter(topic_id=topic) if topic else qs


class IsParentUser(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == User.Roles.PARENT


class AddVideoView(generics.CreateAPIView):
    # Parent-facing "add a learning video": creates Level/Subject/Topic on the fly and an
    # auto-approved Video, so it shows up in the child's Learn catalog immediately.
    permission_classes = [IsParentUser]
    serializer_class = VideoCreateSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        video = serializer.save()
        return Response(MyVideoSerializer(video).data, status=status.HTTP_201_CREATED)


class MyVideosView(generics.ListAPIView):
    # The videos this parent has personally added (their curation, not the shared admin catalog).
    permission_classes = [IsParentUser]
    serializer_class = MyVideoSerializer

    def get_queryset(self):
        return Video.objects.filter(approved_by=self.request.user).order_by('-created_at')


class DeleteMyVideoView(generics.DestroyAPIView):
    # A parent can only remove a video they personally added, never the shared curated catalog.
    permission_classes = [IsParentUser]

    def get_queryset(self):
        return Video.objects.filter(approved_by=self.request.user)
