from django.urls import path
from analytics.views import AdultAnalyticsView, ParentAnalyticsView

urlpatterns = [
    path('adult/', AdultAnalyticsView.as_view(), name='adult_analytics'),
    path('parent/', ParentAnalyticsView.as_view(), name='parent_analytics'),
]
