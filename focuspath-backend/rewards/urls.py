from django.urls import path
from rewards.views import StarWalletView, ChildBadgesListView, AwardView

urlpatterns = [
    path('wallet/', StarWalletView.as_view(), name='star_wallet'),
    path('badges/', ChildBadgesListView.as_view(), name='child_badges'),
    path('award/', AwardView.as_view(), name='award_stars'),
]
