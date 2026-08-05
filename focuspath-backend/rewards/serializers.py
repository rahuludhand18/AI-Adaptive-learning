from rest_framework import serializers
from rewards.models import Badge, ChildBadge, StarReward

class BadgeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Badge
        fields = '__all__'

class ChildBadgeSerializer(serializers.ModelSerializer):
    badge = BadgeSerializer(read_only=True)
    class Meta:
        model = ChildBadge
        fields = ('id', 'badge', 'earned_at')

class StarRewardSerializer(serializers.ModelSerializer):
    balance = serializers.IntegerField(read_only=True)
    class Meta:
        model = StarReward
        fields = ('child', 'stars_earned', 'stars_spent', 'streak_count', 'balance', 'updated_at')
