from django.urls import path
from planner.views import (
    TaskListCreateView, TaskRetrieveUpdateDestroyView,
    AIRebuildScheduleView, AIAcceptRebuiltView, SyllabusParseView,
    GenerateScheduleView,
)

urlpatterns = [
    path('tasks/', TaskListCreateView.as_view(), name='task_list_create'),
    path('tasks/<int:pk>/', TaskRetrieveUpdateDestroyView.as_view(), name='task_retrieve_update_destroy'),
    path('generate/', GenerateScheduleView.as_view(), name='generate_schedule'),
    path('rebuild/', AIRebuildScheduleView.as_view(), name='ai_rebuild_schedule'),
    path('rebuild/accept/', AIAcceptRebuiltView.as_view(), name='ai_accept_rebuilt'),
    path('syllabus-parse/', SyllabusParseView.as_view(), name='syllabus_parse'),
]
