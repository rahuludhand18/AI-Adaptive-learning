from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from rewards.models import ChildBadge, StarReward
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
