from rest_framework import serializers
from focus.models import FocusSession

class FocusSessionSerializer(serializers.ModelSerializer):
    class Meta:
        model = FocusSession
        fields = '__all__'
        read_only_fields = ('id', 'user', 'start_time', 'end_time', 'focus_score', 'is_active')
