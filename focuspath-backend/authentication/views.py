from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.utils import timezone
from users.models import User
from users.serializers import RegisterSerializer, UserSerializer

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        # Allow signing in with either username OR email: if an email was entered,
        # resolve it to that account's username before the normal credential check.
        login = attrs.get(self.username_field)
        if login and '@' in login:
            match = User.objects.filter(email__iexact=login).first()
            if match:
                attrs[self.username_field] = match.username

        # Base validation handles credentials checking
        data = super().validate(attrs)
        
        user = self.user
        
        # Check if the user is a kid and locked out
        if user.role == User.Roles.KID and user.is_locked:
            now = timezone.now()
            # If there is a temporary session and it has not expired, allow login
            if user.temporary_session_until and user.temporary_session_until > now:
                # Still within the temporary session window
                pass
            else:
                # Deny login and throw exception
                raise PermissionError("Account locked due to excessive tab switching. Parent approval is required.")
        
        # Append extra user info to token response
        data['user'] = UserSerializer(user).data
        return data

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        try:
            serializer.is_valid(raise_exception=True)
            return Response(serializer.validated_data, status=status.HTTP_200_OK)
        except PermissionError as e:
            return Response(
                {"detail": str(e), "code": "account_locked"},
                status=status.HTTP_403_FORBIDDEN
            )
        except Exception as e:
            return super().post(request, *args, **kwargs)

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (AllowAny,)
    authentication_classes = ()
    serializer_class = RegisterSerializer

class UserProfileView(generics.RetrieveAPIView):
    permission_classes = (IsAuthenticated,)
    serializer_class = UserSerializer

    def get_object(self):
        return self.request.user
