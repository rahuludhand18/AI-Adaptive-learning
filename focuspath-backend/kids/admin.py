from django.contrib import admin
from kids.models import Quest, QuestCompletion, DailyPuzzle, PuzzleAttempt


@admin.register(Quest)
class QuestAdmin(admin.ModelAdmin):
    list_display = ('title', 'reward_stars', 'order', 'is_active')
    list_editable = ('order', 'is_active')


@admin.register(DailyPuzzle)
class DailyPuzzleAdmin(admin.ModelAdmin):
    list_display = ('question', 'reward_stars', 'is_active')
    list_editable = ('is_active',)


admin.site.register(QuestCompletion)
admin.site.register(PuzzleAttempt)
