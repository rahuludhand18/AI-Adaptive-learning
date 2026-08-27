from rest_framework import generics, status, views
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.utils import timezone
from django.contrib.auth.hashers import check_password, make_password
from users.models import User
from users.serializers import RegisterSerializer, UserSerializer
from authentication.models import LoginEvent

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
        
        # Record this successful sign-in so a parent can see exactly when their child logged in
        LoginEvent.objects.create(user=user, event_type=LoginEvent.EventType.LOGIN)

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


class LogoutLogView(views.APIView):
    # JWT is stateless (no server-side session to invalidate) — this endpoint exists purely
    # so a parent can see exactly when their child signed out, paired with the LOGIN event.
    permission_classes = (IsAuthenticated,)

    def post(self, request):
        LoginEvent.objects.create(user=request.user, event_type=LoginEvent.EventType.LOGOUT)
        return Response({"detail": "Logged."}, status=status.HTTP_201_CREATED)


class VerifyPinView(generics.GenericAPIView):
    permission_classes = (IsAuthenticated,)

    def post(self, request, *args, **kwargs):
        pin = request.data.get('pin')
        if not pin or len(str(pin)) != 4:
            return Response({"success": False, "error": "Invalid PIN format. Must be 4 digits."}, status=status.HTTP_400_BAD_REQUEST)
            
        user = request.user
        # If no PIN is set, the first one entered becomes the PIN
        if not user.parent_pin:
            user.parent_pin = make_password(str(pin))
            user.save()
            return Response({"success": True, "role_token": "parent"})
            
        if check_password(str(pin), user.parent_pin):
            return Response({"success": True, "role_token": "parent"})
            
        return Response({"success": False, "error": "Incorrect PIN."}, status=status.HTTP_403_FORBIDDEN)
