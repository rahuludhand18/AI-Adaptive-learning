from rest_framework import serializers
from .models import Subject, Module, Topic, StudySession

class TopicSerializer(serializers.ModelSerializer):
    class Meta:
        model = Topic
        fields = '__all__'

class ModuleSerializer(serializers.ModelSerializer):
    topics = TopicSerializer(many=True, read_only=True)
    class Meta:
        model = Module
        fields = '__all__'

class SubjectSerializer(serializers.ModelSerializer):
    modules = ModuleSerializer(many=True, read_only=True)
    class Meta:
        model = Subject
        fields = '__all__'

class StudySessionSerializer(serializers.ModelSerializer):
    topic_name = serializers.CharField(source='topic.name', read_only=True)
    module_title = serializers.CharField(source='topic.module.title', read_only=True)
    subject_name = serializers.CharField(source='topic.module.subject.name', read_only=True)
    subject_color = serializers.CharField(source='topic.module.subject.color_code', read_only=True)
    
    class Meta:
        model = StudySession
        fields = '__all__'
        read_only_fields = ['user', 'is_completed', 'tab_switch_count', 'focus_score']
