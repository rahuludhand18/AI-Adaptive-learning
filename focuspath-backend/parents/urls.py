from django.urls import path
from parents.views import (
    ParentApprovalListView, ParentApprovalResolveView, ParentKidsView, RestrictionDetailView,
    ChildActivityView,
)

urlpatterns = [
    path('approvals/', ParentApprovalListView.as_view(), name='parent_approvals_list'),
    path('approvals/<int:pk>/resolve/', ParentApprovalResolveView.as_view(), name='parent_approval_resolve'),
    path('kids/', ParentKidsView.as_view(), name='parent_kids'),
    path('restrictions/<int:child_id>/', RestrictionDetailView.as_view(), name='child_restriction_detail'),
    path('activity/<int:child_id>/', ChildActivityView.as_view(), name='child_activity'),
]
