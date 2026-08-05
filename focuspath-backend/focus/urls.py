from django.urls import path
from focus.views import StartFocusSessionView, EndFocusSessionView, TabSwitchView

urlpatterns = [
    path('session/start/', StartFocusSessionView.as_view(), name='start_focus_session'),
    path('session/end/', EndFocusSessionView.as_view(), name='end_focus_session'),
    path('tab-switch/', TabSwitchView.as_view(), name='tab_switch_log'),
]
