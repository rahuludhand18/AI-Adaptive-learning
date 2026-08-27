from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from authentication.views import (
    CustomTokenObtainPairView, RegisterView, UserProfileView, LogoutLogView, VerifyPinView,
)

urlpatterns = [
    path('register/', RegisterView.as_view(), name='auth_register'),
    path('login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('profile/', UserProfileView.as_view(), name='user_profile'),
    path('logout/', LogoutLogView.as_view(), name='auth_logout'),
    path('verify-pin/', VerifyPinView.as_view(), name='verify_pin'),
]
