from django.db import models
from django.conf import settings

class Badge(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    icon_url = models.CharField(max_length=255, blank=True)

    def __str__(self):
        return self.name

class ChildBadge(models.Model):
    child = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='earned_badges'
    )
    badge = models.ForeignKey(Badge, on_delete=models.CASCADE)
    earned_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('child', 'badge')

    def __str__(self):
        return f"{self.child.username} earned {self.badge.name}"

class StarReward(models.Model):
    child = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='star_wallet'
    )
    stars_earned = models.IntegerField(default=0)
    stars_spent = models.IntegerField(default=0)
    streak_count = models.IntegerField(default=0)
    updated_at = models.DateTimeField(auto_now=True)

    @property
    def balance(self):
        return self.stars_earned - self.stars_spent

    def __str__(self):
        return f"{self.child.username}'s stars: {self.balance}"
