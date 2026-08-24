import re
from rest_framework import serializers
from content.models import EducationLevel, Subject, Topic, Video


# Accepts a bare 11-char YouTube ID or any common URL form (watch?v=, youtu.be/, embed/, shorts/).
def extract_youtube_id(value):
    value = (value or '').strip()
    if re.fullmatch(r'[A-Za-z0-9_-]{11}', value):
        return value
    m = re.search(r'(?:v=|youtu\.be/|embed/|shorts/)([A-Za-z0-9_-]{11})', value)
    return m.group(1) if m else None


# Parent-facing "add a video" form: names instead of IDs so the parent never has to know
# about Level/Subject/Topic rows — they get created on the fly if they don't already exist.
class VideoCreateSerializer(serializers.Serializer):
    youtube_url = serializers.CharField()
    title = serializers.CharField(max_length=200)
    level_name = serializers.CharField(max_length=100)
    subject_name = serializers.CharField(max_length=120)
    topic_title = serializers.CharField(max_length=200)
    source_channel = serializers.CharField(max_length=120, required=False, allow_blank=True)
    age_min = serializers.IntegerField(required=False, default=3)
    age_max = serializers.IntegerField(required=False, default=15)

    def validate_youtube_url(self, value):
        video_id = extract_youtube_id(value)
        if not video_id:
            raise serializers.ValidationError('Could not read a YouTube video ID from that link.')
        return video_id

    def create(self, validated_data):
        user = self.context['request'].user
        level, _ = EducationLevel.objects.get_or_create(name=validated_data['level_name'].strip())
        subject, _ = Subject.objects.get_or_create(level=level, name=validated_data['subject_name'].strip())
        topic, _ = Topic.objects.get_or_create(subject=subject, title=validated_data['topic_title'].strip())
        return Video.objects.create(
            topic=topic,
            youtube_id=validated_data['youtube_url'],  # already converted to the ID by validate_youtube_url
            title=validated_data['title'].strip(),
            source_channel=validated_data.get('source_channel', '').strip(),
            age_min=validated_data.get('age_min', 3),
            age_max=validated_data.get('age_max', 15),
            is_approved=True,       # a parent adding content for their own child is implicit approval
            approved_by=user,
        )


class VideoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Video
        # youtube_id is exposed, but only approved rows ever reach the serializer (see views)
        fields = ('id', 'topic', 'youtube_id', 'title', 'duration_seconds',
                  'source_channel', 'age_min', 'age_max')


class MyVideoSerializer(serializers.ModelSerializer):
    # a parent's own added-videos list, with the readable names instead of raw FK ids
    level_name = serializers.CharField(source='topic.subject.level.name', read_only=True)
    subject_name = serializers.CharField(source='topic.subject.name', read_only=True)
    topic_title = serializers.CharField(source='topic.title', read_only=True)

    class Meta:
        model = Video
        fields = ('id', 'title', 'youtube_id', 'source_channel', 'age_min', 'age_max',
                  'level_name', 'subject_name', 'topic_title', 'created_at')


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
