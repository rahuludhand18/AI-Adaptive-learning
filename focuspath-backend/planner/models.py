from django.db import models
from django.conf import settings

class Task(models.Model):
    class Statuses(models.TextChoices):
        ACTIVE = 'ACTIVE', 'Active'
        UPDATED = 'UPDATED', 'Updated'
        ARCHIVED = 'ARCHIVED', 'Archived'
        COMPLETED = 'COMPLETED', 'Completed'

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='tasks'
    )
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    deadline = models.DateTimeField()
    priority = models.IntegerField(default=1) # 1 = Low, 2 = Medium, 3 = High
    status = models.CharField(
        max_length=15,
        choices=Statuses.choices,
        default=Statuses.ACTIVE
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def delete(self, *args, **kwargs):
        # Prevent hard delete! Instead, switch to ARCHIVED status.
        self.status = self.Statuses.ARCHIVED
        self.save()

    def __str__(self):
        return f"{self.title} ({self.status}) for {self.user.username}"
