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
        fields = ('id', 'username', 'email', 'role', 'is_locked', 'tab_switch_count', 'temporary_session_until')
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

import secrets
import string

class KidCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('username',)

    def create(self, validated_data):
        parent = self.context['request'].user
        
        # Auto-generate a highly secure random password since children don't log in directly
        alphabet = string.ascii_letters + string.digits + "!@#$%^&*"
        secure_password = ''.join(secrets.choice(alphabet) for i in range(24))
        
        user = User.objects.create_user(
            username=validated_data['username'],
            password=secure_password,
            role=User.Roles.KID
        )
        # Create relation
        ParentChildRelation.objects.create(parent=parent, child=user)
        return user

    def to_representation(self, instance):
        return UserSerializer(instance).data
