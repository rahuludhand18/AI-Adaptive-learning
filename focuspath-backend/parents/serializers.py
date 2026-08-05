from rest_framework import serializers
from parents.models import Restriction, ApprovalRequest
from users.serializers import UserSerializer

class RestrictionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Restriction
        fields = ('id', 'child', 'daily_screen_time_limit', 'session_limit', 'eye_break_interval', 'whitelisted_websites', 'blacklisted_websites', 'blocked_apps')
        read_only_fields = ('id', 'child')

class ApprovalRequestSerializer(serializers.ModelSerializer):
    child = UserSerializer(read_only=True)
    class Meta:
        model = ApprovalRequest
        fields = ('id', 'child', 'reason', 'status', 'temporary_session_duration', 'created_at', 'resolved_at')
        read_only_fields = ('id', 'child', 'reason', 'created_at', 'resolved_at')

class ResolveApprovalSerializer(serializers.Serializer):
    action = serializers.ChoiceField(choices=['APPROVED', 'REJECTED'])
    duration = serializers.IntegerField(default=120, min_value=5, max_value=1440)
