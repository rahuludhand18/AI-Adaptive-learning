from django.urls import path
from parents.views import ParentApprovalListView, ParentApprovalResolveView, ParentAddKidView, RestrictionDetailView

urlpatterns = [
    path('approvals/', ParentApprovalListView.as_view(), name='parent_approvals_list'),
    path('approvals/<int:pk>/resolve/', ParentApprovalResolveView.as_view(), name='parent_approval_resolve'),
    path('kids/', ParentAddKidView.as_view(), name='parent_add_kid'),
    path('restrictions/<int:child_id>/', RestrictionDetailView.as_view(), name='child_restriction_detail'),
]
