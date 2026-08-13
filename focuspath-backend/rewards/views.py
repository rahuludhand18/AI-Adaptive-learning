from datetime import timedelta
from rest_framework import generics, views, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from rewards.models import Badge, ChildBadge, StarReward
from rewards.serializers import ChildBadgeSerializer, StarRewardSerializer

class StarWalletView(generics.RetrieveAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = StarRewardSerializer

    def get_object(self):
        wallet, created = StarReward.objects.get_or_create(child=self.request.user)
        return wallet

class ChildBadgesListView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ChildBadgeSerializer

    def get_queryset(self):
        return ChildBadge.objects.filter(child=self.request.user)

class AwardView(views.APIView):
    # Award stars (and optionally a named badge) for a real event such as finishing a
    # video, quest or puzzle. Called by the frontend when the child completes something.
    permission_classes = [IsAuthenticated]

    def post(self, request):
        amount = int(request.data.get('amount', 0) or 0)
        badge_name = request.data.get('badge')

        wallet, created = StarReward.objects.get_or_create(child=request.user)

        if amount > 0:
            # simple daily streak based on the last award day
            today = timezone.now().date()
            last_day = wallet.updated_at.date() if not created else None
            if created or last_day is None:
                wallet.streak_count = max(wallet.streak_count, 1)
            elif last_day == today:
                pass  # already counted today
            elif last_day == today - timedelta(days=1):
                wallet.streak_count += 1  # consecutive day
            else:
                wallet.streak_count = 1  # streak broken, restart
            wallet.stars_earned += amount
            wallet.save()

        awarded_badge = None
        if badge_name:
            badge, _ = Badge.objects.get_or_create(name=badge_name)
            _, new_badge = ChildBadge.objects.get_or_create(child=request.user, badge=badge)
            awarded_badge = badge_name if new_badge else None

        return Response({
            'balance': wallet.balance,
            'stars_earned': wallet.stars_earned,
            'streak_count': wallet.streak_count,
            'awarded_badge': awarded_badge,
        }, status=status.HTTP_200_OK)
