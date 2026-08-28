from django.db import models
from django.conf import settings


# Top level of the learning catalog: e.g. Nursery, Grade 5, Engineering Sem 6.
class EducationLevel(models.Model):
    name = models.CharField(max_length=100, unique=True)
    order = models.IntegerField(default=0)  # controls display order in the UI

    class Meta:
        ordering = ['order', 'name']

    def __str__(self):
        return self.name


# A subject inside a level, e.g. Maths under Grade 5.
class Subject(models.Model):
    level = models.ForeignKey(EducationLevel, on_delete=models.CASCADE, related_name='subjects')
    name = models.CharField(max_length=120)
    order = models.IntegerField(default=0)

    class Meta:
        ordering = ['order', 'name']
        unique_together = ('level', 'name')

    def __str__(self):
        return f"{self.name} ({self.level.name})"


# A topic inside a subject, e.g. Fractions under Maths.
class Topic(models.Model):
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE, related_name='topics')
    title = models.CharField(max_length=200)
    order = models.IntegerField(default=0)

    class Meta:
        ordering = ['order', 'title']

    def __str__(self):
        return f"{self.title} ({self.subject.name})"


# A curated YouTube video attached to a topic. Children only ever see approved videos.
class Video(models.Model):
    topic = models.ForeignKey(Topic, on_delete=models.CASCADE, related_name='videos')
    youtube_id = models.CharField(max_length=20)  # store the ID only, never the full URL
    title = models.CharField(max_length=200)
    duration_seconds = models.IntegerField(default=0)
    source_channel = models.CharField(max_length=120, blank=True)
    is_approved = models.BooleanField(default=False)  # a parent/teacher must approve before it is visible
    approved_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
        null=True, blank=True, related_name='approved_videos'
    )
    age_min = models.IntegerField(default=3)   # youngest suitable age
    age_max = models.IntegerField(default=15)  # kid content is capped at under-16
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['topic', 'title']

    def __str__(self):
        flag = 'approved' if self.is_approved else 'pending'
        return f"{self.title} [{flag}]"

# Cache AI generated notes for a video
class AINotes(models.Model):
    video_id = models.CharField(max_length=20, unique=True, db_index=True)
    notes_markdown = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"AI Notes for Video: {self.video_id}"
