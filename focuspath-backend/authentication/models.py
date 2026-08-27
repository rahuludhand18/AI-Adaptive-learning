from django.db import models
from django.conf import settings


# One row per sign-in / sign-out, so a parent can see every time a child logged in or out
# (paired into readable sessions by ChildActivityView), not just tab-switch counts.
class LoginEvent(models.Model):
    class EventType(models.TextChoices):
        LOGIN = 'LOGIN', 'Login'
        LOGOUT = 'LOGOUT', 'Logout'

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='login_events')
    event_type = models.CharField(max_length=10, choices=EventType.choices)
    occurred_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['occurred_at']

    def __str__(self):
        return f"{self.user.username} {self.event_type} @ {self.occurred_at}"
