from django.db import models
from django.contrib.auth.models import AbstractUser

# age_group string -> (min_age, max_age) numeric bounds, used to filter Video.age_min/age_max.
AGE_GROUP_BOUNDS = {
    '1-3': (1, 3),
    '4-6': (4, 6),
    '7-8': (7, 8),
    '9-10': (9, 10),
    '11-12': (11, 12),
}

class User(AbstractUser):
    class Roles(models.TextChoices):
        ADULT = 'ADULT', 'Adult'
        PARENT = 'PARENT', 'Parent'
        KID = 'KID', 'Kid'

    # Age bracket a parent assigns when creating a Kid profile. Drives automatic content
    # filtering on the Learn page (Video.age_min/age_max) — no manual grade picking needed.
    class AgeGroups(models.TextChoices):
        AGE_1_3 = '1-3', '1-3 years'
        AGE_4_6 = '4-6', '4-6 years'
        AGE_7_8 = '7-8', '7-8 years'
        AGE_9_10 = '9-10', '9-10 years'
        AGE_11_12 = '11-12', '11-12 years'

    role = models.CharField(
        max_length=10,
        choices=Roles.choices,
        default=Roles.ADULT
    )
    age_group = models.CharField(
        max_length=10, choices=AgeGroups.choices, null=True, blank=True
    )  # only set for KID accounts
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
