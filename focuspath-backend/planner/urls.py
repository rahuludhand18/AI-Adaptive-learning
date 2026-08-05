from django.urls import path
from planner.views import TaskListCreateView, TaskRetrieveUpdateDestroyView, AIRebuildScheduleView, AIAcceptRebuiltView

urlpatterns = [
    path('tasks/', TaskListCreateView.as_view(), name='task_list_create'),
    path('tasks/<int:pk>/', TaskRetrieveUpdateDestroyView.as_view(), name='task_retrieve_update_destroy'),
    path('rebuild/', AIRebuildScheduleView.as_view(), name='ai_rebuild_schedule'),
    path('rebuild/accept/', AIAcceptRebuiltView.as_view(), name='ai_accept_rebuilt'),
]
