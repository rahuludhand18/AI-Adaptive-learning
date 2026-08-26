from users.models import User
from focus.models import FocusSession, TabActivityEvent
from rewards.models import StarReward, ChildBadge
from django.utils import timezone
from datetime import timedelta

chintu = User.objects.filter(username__icontains='Chintu').first()
if chintu:
    StarReward.objects.get_or_create(child=chintu, defaults={'stars_earned': 145, 'streak_count': 3})
    StarReward.objects.filter(child=chintu).update(stars_earned=145, streak_count=3)
    
    now = timezone.now()
    FocusSession.objects.filter(user=chintu).delete()
    TabActivityEvent.objects.filter(user=chintu).delete()
    ChildBadge.objects.filter(child=chintu).delete()
    
    from rewards.models import Badge
    scholar, _ = Badge.objects.get_or_create(name='Scholar', defaults={'description': 'Completed 3 lessons', 'icon_url': '🎓'})
    master, _ = Badge.objects.get_or_create(name='Focus Master', defaults={'description': 'Studied for 1 hour without leaving', 'icon_url': '⭐'})
    
    ChildBadge.objects.create(child=chintu, badge=scholar)
    ChildBadge.objects.create(child=chintu, badge=master)
    
    FocusSession.objects.create(user=chintu, start_time=now - timedelta(hours=3), end_time=now - timedelta(hours=2, minutes=30), is_active=False, focus_score=85, tab_switch_count=1)
    FocusSession.objects.create(user=chintu, start_time=now - timedelta(days=1, hours=2), end_time=now - timedelta(days=1, hours=1), is_active=False, focus_score=92, tab_switch_count=0)
    FocusSession.objects.create(user=chintu, start_time=now - timedelta(days=2, hours=4), end_time=now - timedelta(days=2, hours=2, minutes=15), is_active=False, focus_score=78, tab_switch_count=3)
    
    TabActivityEvent.objects.create(user=chintu, event_type='LEFT', timestamp=now - timedelta(minutes=40))
    TabActivityEvent.objects.create(user=chintu, event_type='RETURN', timestamp=now - timedelta(minutes=35))
    TabActivityEvent.objects.create(user=chintu, event_type='LEFT', timestamp=now - timedelta(days=1, minutes=120))
    TabActivityEvent.objects.create(user=chintu, event_type='RETURN', timestamp=now - timedelta(days=1, minutes=110))

print("Seeded successfully")
