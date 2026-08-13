from django.db import migrations


# Seed a few starter quests and one daily puzzle so the kid dashboard is usable
# immediately. Safe to run once; skips if data already exists.
def seed(apps, schema_editor):
    Quest = apps.get_model('kids', 'Quest')
    DailyPuzzle = apps.get_model('kids', 'DailyPuzzle')

    if not Quest.objects.exists():
        Quest.objects.bulk_create([
            Quest(title='Math Quest: Space Division', subtitle='Help astronauts divide the star-crystals!', reward_stars=50, icon='calculator', order=1),
            Quest(title='Reading Journey', subtitle='The Secret Library of Elves', reward_stars=40, icon='book', order=2),
            Quest(title='Science Lab', subtitle='Mix colors and discover reactions', reward_stars=45, icon='flask', order=3),
        ])

    if not DailyPuzzle.objects.exists():
        DailyPuzzle.objects.create(
            question='What is 7 + 5?',
            options=['10', '11', '12', '13'],
            correct_index=2,
            reward_stars=10,
        )


class Migration(migrations.Migration):
    dependencies = [('kids', '0001_initial')]
    operations = [migrations.RunPython(seed, migrations.RunPython.noop)]
