from rest_framework import serializers
from content.models import EducationLevel, Subject, Topic, Video


class VideoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Video
        # youtube_id is exposed, but only approved rows ever reach the serializer (see views)
        fields = ('id', 'topic', 'youtube_id', 'title', 'duration_seconds',
                  'source_channel', 'age_min', 'age_max')


class TopicSerializer(serializers.ModelSerializer):
    class Meta:
        model = Topic
        fields = ('id', 'subject', 'title', 'order')


class SubjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subject
        fields = ('id', 'level', 'name', 'order')


class EducationLevelSerializer(serializers.ModelSerializer):
    class Meta:
        model = EducationLevel
        fields = ('id', 'name', 'order')
