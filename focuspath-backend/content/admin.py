from django.contrib import admin
from content.models import EducationLevel, Subject, Topic, Video


@admin.register(EducationLevel)
class EducationLevelAdmin(admin.ModelAdmin):
    list_display = ('name', 'order')
    ordering = ('order',)


@admin.register(Subject)
class SubjectAdmin(admin.ModelAdmin):
    list_display = ('name', 'level', 'order')
    list_filter = ('level',)


@admin.register(Topic)
class TopicAdmin(admin.ModelAdmin):
    list_display = ('title', 'subject', 'order')
    list_filter = ('subject__level', 'subject')


@admin.register(Video)
class VideoAdmin(admin.ModelAdmin):
    # this list is the parent/teacher curation screen — approve videos here before kids see them
    list_display = ('title', 'topic', 'source_channel', 'is_approved')
    list_filter = ('is_approved', 'topic__subject__level')
    search_fields = ('title', 'youtube_id', 'source_channel')
    list_editable = ('is_approved',)  # quick approve/unapprove toggle
