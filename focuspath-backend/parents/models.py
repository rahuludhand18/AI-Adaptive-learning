from django.db import models
from django.conf import settings

class Restriction(models.Model):
    child = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='restriction_profile'
    )
    daily_screen_time_limit = models.IntegerField(default=120) # in minutes
    session_limit = models.IntegerField(default=45) # in minutes
    eye_break_interval = models.IntegerField(default=20) # in minutes
    whitelisted_websites = models.JSONField(default=list)
    blacklisted_websites = models.JSONField(default=list)
    blocked_apps = models.JSONField(default=list)

    def __str__(self):
        return f"Restrictions for {self.child.username}"

class ApprovalRequest(models.Model):
    class ApprovalStatus(models.TextChoices):
        PENDING = 'PENDING', 'Pending'
        APPROVED = 'APPROVED', 'Approved'
        REJECTED = 'REJECTED', 'Rejected'

    child = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='approval_requests'
    )
    parent = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='resolved_requests',
        null=True,
        blank=True
    )
    reason = models.CharField(max_length=255)
    status = models.CharField(
        max_length=10,
        choices=ApprovalStatus.choices,
        default=ApprovalStatus.PENDING
    )
    temporary_session_duration = models.IntegerField(default=120) # in minutes
    created_at = models.DateTimeField(auto_now_add=True)
    resolved_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"Request from {self.child.username} - {self.status}"
