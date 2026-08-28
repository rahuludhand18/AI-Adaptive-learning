"""
URL configuration for config project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('authentication.urls')),
    path('api/user/', include('users.urls')),
    path('api/focus/', include('focus.urls')),
    path('api/planner/', include('planner.urls')),
    path('api/parents/', include('parents.urls')),
    path('api/rewards/', include('rewards.urls')),
    path('api/content/', include('content.urls')),
    path('api/analytics/', include('analytics.urls')),
    path('api/learn/videos/', __import__('content.views').views.YouTubeSearchView.as_view(), name='learn-videos'),
    path('api/learn/video-chat/', __import__('content.views').views.VideoChatView.as_view(), name='video-chat'),
    path('api/kids/', include('kids.urls')),
    path('api/parent/analytics/<str:child_id>/', __import__('analytics.views').views.ParentAggregateAnalyticsView.as_view(), name='parent-analytics-all'),
]
