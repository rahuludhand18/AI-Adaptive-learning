from django.urls import path
from rewards.views import StarWalletView, ChildBadgesListView

urlpatterns = [
    path('wallet/', StarWalletView.as_view(), name='star_wallet'),
    path('badges/', ChildBadgesListView.as_view(), name='child_badges'),
]
