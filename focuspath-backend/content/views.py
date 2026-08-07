from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from content.models import EducationLevel, Subject, Topic, Video
from content.serializers import (
    EducationLevelSerializer, SubjectSerializer, TopicSerializer, VideoSerializer
)


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
