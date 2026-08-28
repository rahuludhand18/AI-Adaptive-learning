from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from users.models import User, ParentChildRelation, UserRoutine

class UserRoutineSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserRoutine
        exclude = ('id', 'user')

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'role', 'age_group', 'grade_level', 'parent_pin', 'kid_pin_plain', 'is_locked', 'tab_switch_count', 'temporary_session_until')
        read_only_fields = ('id', 'is_locked', 'tab_switch_count', 'temporary_session_until')

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    email = serializers.EmailField(required=True)

    class Meta:
        model = User
        fields = ('username', 'email', 'password', 'role')

    def validate_role(self, value):
        if value == User.Roles.KID:
            raise serializers.ValidationError("Kid accounts must be created by a Parent from their dashboard.")
        return value

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            role=validated_data['role']
        )
        return user

class KidCreateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    # required so the Learn page can filter content to the right age bracket from day one
    age_group = serializers.ChoiceField(choices=User.AgeGroups.choices, required=True)
    grade_level = serializers.CharField(max_length=20, required=False, allow_blank=True)
    parent_pin = serializers.CharField(max_length=4, required=False, allow_blank=True)

    class Meta:
        model = User
        fields = ('username', 'password', 'age_group', 'grade_level', 'parent_pin')

    def create(self, validated_data):
        parent = self.context['request'].user
        
        user = User.objects.create_user(
            username=validated_data['username'],
            password=validated_data['password'],
            role=User.Roles.KID,
            age_group=validated_data.get('age_group'),
            grade_level=validated_data.get('grade_level'),
            kid_pin_plain=validated_data['password'][:4],
        )
        # Create relation
        ParentChildRelation.objects.create(parent=parent, child=user)
        return user

    def to_representation(self, instance):
        return UserSerializer(instance).data
