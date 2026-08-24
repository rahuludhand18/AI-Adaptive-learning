from django.urls import path
from content.views import (
    LevelListView, SubjectListView, TopicListView, VideoListView,
    AddVideoView, MyVideosView, DeleteMyVideoView,
)

urlpatterns = [
    path('levels/', LevelListView.as_view(), name='content-levels'),
    path('subjects/', SubjectListView.as_view(), name='content-subjects'),
    path('topics/', TopicListView.as_view(), name='content-topics'),
    path('videos/', VideoListView.as_view(), name='content-videos'),
    path('videos/add/', AddVideoView.as_view(), name='content-video-add'),
    path('videos/mine/', MyVideosView.as_view(), name='content-video-mine'),
    path('videos/mine/<int:pk>/', DeleteMyVideoView.as_view(), name='content-video-mine-delete'),
]
