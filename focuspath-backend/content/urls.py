from django.urls import path
from content.views import LevelListView, SubjectListView, TopicListView, VideoListView

urlpatterns = [
    path('levels/', LevelListView.as_view(), name='content-levels'),
    path('subjects/', SubjectListView.as_view(), name='content-subjects'),
    path('topics/', TopicListView.as_view(), name='content-topics'),
    path('videos/', VideoListView.as_view(), name='content-videos'),
]
