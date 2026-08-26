from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class Subject(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='subjects')
    name = models.CharField(max_length=255) # e.g., "Artificial Intelligence"
    color_code = models.CharField(max_length=7, default="#4F46E5") # For UI clinical color mapping
    target_exam_date = models.DateField(null=True, blank=True)
    difficulty = models.CharField(max_length=10, default='Medium')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.name} ({self.user.username})"


class Module(models.Model):
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE, related_name='modules')
    title = models.CharField(max_length=255) # e.g., "Module 1: Intelligent Agents"
    order_index = models.PositiveIntegerField(default=0) # Ensures Module 1 always stays above Module 2

    class Meta:
        ordering = ['order_index', 'id']

    def __str__(self):
        return f"{self.subject.name} - {self.title}"


class Topic(models.Model):
    module = models.ForeignKey(Module, on_delete=models.CASCADE, related_name='topics')
    name = models.CharField(max_length=255) # e.g., "Concept of Rationality"
    estimated_hours = models.FloatField(help_text="Hours required to master this topic")
    is_completed = models.BooleanField(default=False)
    order_index = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order_index', 'id']

    def __str__(self):
        return self.name


class StudySession(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='study_sessions')
    topic = models.ForeignKey(Topic, on_delete=models.CASCADE, related_name='sessions')
    
    # Scheduling fields
    date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()
    
    # State tracking
    is_completed = models.BooleanField(default=False)
    tab_switch_count = models.PositiveIntegerField(default=0) # Tied to your Page Visibility API logic
    focus_score = models.IntegerField(default=100, help_text="Deducted dynamically if user loses focus")

    class Meta:
        ordering = ['date', 'start_time']

    def __str__(self):
        return f"{self.topic.name} | {self.date} [{self.start_time}-{self.end_time}]"
