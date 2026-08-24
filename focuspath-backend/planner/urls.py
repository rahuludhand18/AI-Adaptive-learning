from django.urls import path
from planner.views import (
    TaskListCreateView, TaskRetrieveUpdateDestroyView,
    AIRebuildScheduleView, AIAcceptRebuiltView, SyllabusParseView,
    GenerateScheduleView, SyllabusUploadView, ClearScheduleView, PlannerAssistantView,
    CarryOverView,
)

urlpatterns = [
    path('tasks/', TaskListCreateView.as_view(), name='task_list_create'),
    path('tasks/<int:pk>/', TaskRetrieveUpdateDestroyView.as_view(), name='task_retrieve_update_destroy'),
    path('generate/', GenerateScheduleView.as_view(), name='generate_schedule'),
    path('clear/', ClearScheduleView.as_view(), name='clear_schedule'),
    path('carryover/', CarryOverView.as_view(), name='carry_over'),
    path('assistant/', PlannerAssistantView.as_view(), name='planner_assistant'),
    path('rebuild/', AIRebuildScheduleView.as_view(), name='ai_rebuild_schedule'),
    path('rebuild/accept/', AIAcceptRebuiltView.as_view(), name='ai_accept_rebuilt'),
    path('syllabus-parse/', SyllabusParseView.as_view(), name='syllabus_parse'),
    path('syllabus-upload/', SyllabusUploadView.as_view(), name='syllabus_upload'),
]
