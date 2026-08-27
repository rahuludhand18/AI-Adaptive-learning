from django.urls import path
from .views import UserRoutineView

urlpatterns = [
    path('routine/', UserRoutineView.as_view(), name='user-routine'),
]
