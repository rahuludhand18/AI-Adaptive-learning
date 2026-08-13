from django.db import models
from django.conf import settings


# A study quest a child can complete for stars (curated via admin).
class Quest(models.Model):
    title = models.CharField(max_length=120)
    subtitle = models.CharField(max_length=200, blank=True)
    reward_stars = models.IntegerField(default=50)
    icon = models.CharField(max_length=40, blank=True)  # frontend icon key
    order = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['order', 'id']

    def __str__(self):
        return self.title


# Records that a child finished a quest (one row per child+quest).
class QuestCompletion(models.Model):
    child = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='quest_completions')
    quest = models.ForeignKey(Quest, on_delete=models.CASCADE)
    completed_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('child', 'quest')


# A multiple-choice daily brain puzzle.
class DailyPuzzle(models.Model):
    question = models.CharField(max_length=255)
    options = models.JSONField(default=list)   # list of option strings
    correct_index = models.IntegerField(default=0)
    reward_stars = models.IntegerField(default=10)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.question


# A child's single attempt at a puzzle (blocks repeat scoring).
class PuzzleAttempt(models.Model):
    child = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='puzzle_attempts')
    puzzle = models.ForeignKey(DailyPuzzle, on_delete=models.CASCADE)
    correct = models.BooleanField(default=False)
    attempted_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('child', 'puzzle')
