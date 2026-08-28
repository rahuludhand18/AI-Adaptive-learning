from django.urls import path
from planner.views import (
    SubjectListCreateView, SubjectRetrieveUpdateDestroyView,
    StudySessionListCreateView, StudySessionRetrieveUpdateDestroyView,
    GenerateScheduleView, SyllabusUploadView, ClearScheduleView, AIRebuildScheduleView,
    AIAssistantView, CarryOverSessionsView, CarryOverSingleSessionView
)

urlpatterns = [
    path('subjects/', SubjectListCreateView.as_view(), name='subject_list_create'),
    path('subjects/<int:pk>/', SubjectRetrieveUpdateDestroyView.as_view(), name='subject_retrieve_update_destroy'),
    
    path('sessions/', StudySessionListCreateView.as_view(), name='session_list_create'),
    path('sessions/carry_over/', CarryOverSessionsView.as_view(), name='session_carry_over'),
    path('sessions/<int:pk>/carry_over/', CarryOverSingleSessionView.as_view(), name='session_single_carry_over'),
    path('sessions/<int:pk>/', StudySessionRetrieveUpdateDestroyView.as_view(), name='session_retrieve_update_destroy'),
    
    path('generate/', GenerateScheduleView.as_view(), name='generate_schedule'),
    path('clear/', ClearScheduleView.as_view(), name='clear_schedule'),
    path('rebuild/', AIRebuildScheduleView.as_view(), name='ai_rebuild_schedule'),
    path('syllabus-upload/', SyllabusUploadView.as_view(), name='syllabus_upload'),
    path('assistant/', AIAssistantView.as_view(), name='ai_assistant'),
]
