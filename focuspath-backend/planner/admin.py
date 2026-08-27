from django.contrib import admin
from .models import Subject, Module, Topic, StudySession

admin.site.register(Subject)
admin.site.register(Module)
admin.site.register(Topic)
admin.site.register(StudySession)
