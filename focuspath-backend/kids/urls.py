from django.urls import path
from kids.views import (
    QuestListView, QuestCompleteView, TodayPuzzleView, PuzzleAnswerView, MySettingsView,
    VerifyMorseView,
)

urlpatterns = [
    path('my-settings/', MySettingsView.as_view(), name='kids_my_settings'),
    path('verify-morse/', VerifyMorseView.as_view(), name='kids_verify_morse'),
    path('quests/', QuestListView.as_view(), name='kids_quests'),
    path('quests/<int:pk>/complete/', QuestCompleteView.as_view(), name='kids_quest_complete'),
    path('puzzle/today/', TodayPuzzleView.as_view(), name='kids_puzzle_today'),
    path('puzzle/<int:pk>/answer/', PuzzleAnswerView.as_view(), name='kids_puzzle_answer'),
]
