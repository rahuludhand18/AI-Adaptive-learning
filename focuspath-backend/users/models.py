from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    class Roles(models.TextChoices):
        ADULT = 'ADULT', 'Adult'
        PARENT = 'PARENT', 'Parent'
        KID = 'KID', 'Kid'

    role = models.CharField(
        max_length=10,
        choices=Roles.choices,
        default=Roles.ADULT
    )
    is_locked = models.BooleanField(default=False)
    tab_switch_count = models.IntegerField(default=0)
    temporary_session_until = models.DateTimeField(null=True, blank=True)
    
    # Hashed parent PIN
    parent_pin = models.CharField(max_length=128, null=True, blank=True)

    def __str__(self):
        return f"{self.username} ({self.role})"

class ParentChildRelation(models.Model):
    parent = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='child_relations',
        limit_choices_to={'role': User.Roles.PARENT}
    )
    child = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='parent_relations',
        limit_choices_to={'role': User.Roles.KID}
    )

    class Meta:
        unique_together = ('parent', 'child')

    def __str__(self):
        return f"Parent: {self.parent.username} -> Kid: {self.child.username}"

class UserRoutine(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='routine')
    morning_study_start = models.TimeField(null=True, blank=True)
    morning_study_end = models.TimeField(null=True, blank=True)
    work_college_start = models.TimeField(null=True, blank=True)
    work_college_end = models.TimeField(null=True, blank=True)
    evening_study_start = models.TimeField(null=True, blank=True)
    evening_study_end = models.TimeField(null=True, blank=True)
    snack_time_start = models.TimeField(null=True, blank=True)
    snack_time_end = models.TimeField(null=True, blank=True)
    dinner_time_start = models.TimeField(null=True, blank=True)
    dinner_time_end = models.TimeField(null=True, blank=True)
    default_daily_hours = models.PositiveIntegerField(default=2)

    def __str__(self):
        return f"Routine for {self.user.username}"
