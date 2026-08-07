from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from users.models import User, ParentChildRelation

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

class KidCreateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])

    class Meta:
        model = User
        fields = ('username', 'password')

    def create(self, validated_data):
        parent = self.context['request'].user
        user = User.objects.create_user(
            username=validated_data['username'],
            password=validated_data['password'],
            role=User.Roles.KID
        )
        # Create relation
        ParentChildRelation.objects.create(parent=parent, child=user)
        return user

    def to_representation(self, instance):
        return UserSerializer(instance).data
