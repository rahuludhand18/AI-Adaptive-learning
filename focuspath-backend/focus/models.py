from django.db import models
from django.conf import settings

class FocusSession(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='focus_sessions'
    )
    start_time = models.DateTimeField(auto_now_add=True)
    end_time = models.DateTimeField(null=True, blank=True)
    tab_switch_count = models.IntegerField(default=0)
    focus_score = models.IntegerField(default=100) # Starts at 100, decays with tab switches
    is_active = models.BooleanField(default=True)

    def calculate_score(self):
        # A simple decay logic for focus score: each tab switch reduces score by 15 points
        base = 100
        penalty = self.tab_switch_count * 15
        self.focus_score = max(0, base - penalty)
        return self.focus_score

    def __str__(self):
        return f"Session for {self.user.username} (Switches: {self.tab_switch_count}, Score: {self.focus_score})"


# One row per tab-hide/tab-return, so a parent can see exactly when a child left the app
# and how long they were away (event_type='left' then a paired 'return').
class TabActivityEvent(models.Model):
    class EventType(models.TextChoices):
        LEFT = 'LEFT', 'Left'
        RETURN = 'RETURN', 'Return'

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='tab_activity_events')
    event_type = models.CharField(max_length=10, choices=EventType.choices)
    occurred_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['occurred_at']

    def __str__(self):
        return f"{self.user.username} {self.event_type} @ {self.occurred_at}"
