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

from django.contrib.auth.hashers import check_password, make_password

class LogoutLogView(views.APIView):
    # JWT is stateless (no server-side session to invalidate) — this endpoint exists purely
    # so a parent can see exactly when their child signed out, paired with the LOGIN event.
    permission_classes = (IsAuthenticated,)

    def post(self, request):
        if request.user.role == User.Roles.KID:
            LoginEvent.objects.create(user=request.user, event_type=LoginEvent.EventType.LOGOUT)
        return Response(status=status.HTTP_205_RESET_CONTENT)

class ChangePasswordView(views.APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        old_password = request.data.get('old_password')
        new_password = request.data.get('new_password')

        if not old_password or not new_password:
            return Response({'error': 'Please provide old_password and new_password'}, status=status.HTTP_400_BAD_REQUEST)

        user = request.user
        if not user.check_password(old_password):
            return Response({'error': 'Incorrect old password'}, status=status.HTTP_400_BAD_REQUEST)

        user.set_password(new_password)
        user.save()
        return Response({'success': 'Password updated successfully'}, status=status.HTTP_200_OK)

class GetHintView(views.APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get('username')
        if not username:
            return Response({'error': 'Please provide username'}, status=status.HTTP_400_BAD_REQUEST)
        
        user = User.objects.filter(username=username).first()
        if not user:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
        
        hint = user.security_hint
        if not hint:
            return Response({'error': 'No security question set for this user'}, status=status.HTTP_400_BAD_REQUEST)
            
        return Response({'security_hint': hint}, status=status.HTTP_200_OK)

class ResetPasswordView(views.APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get('username')
        security_answer = request.data.get('security_answer')
        new_password = request.data.get('new_password')

        if not username or not security_answer or not new_password:
            return Response({'error': 'Missing required fields'}, status=status.HTTP_400_BAD_REQUEST)

        user = User.objects.filter(username=username).first()
        if not user:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

        if not user.security_answer or user.security_answer.lower() != security_answer.lower():
            return Response({'error': 'Incorrect security answer'}, status=status.HTTP_400_BAD_REQUEST)

        user.set_password(new_password)
        user.save()
        return Response({'success': 'Password reset successfully'}, status=status.HTTP_200_OK)

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

class SwitchToParentView(views.APIView):
    permission_classes = (IsAuthenticated,)

    def post(self, request):
        pin = request.data.get('pin')
        if not pin or len(str(pin)) != 4:
            return Response({"detail": "Invalid PIN format."}, status=status.HTTP_400_BAD_REQUEST)

        # Must be a kid trying to switch back to parent
        if request.user.role != User.Roles.KID:
            return Response({"detail": "Only kids can switch to parent."}, status=status.HTTP_400_BAD_REQUEST)

        from users.models import ParentChildRelation
        relation = ParentChildRelation.objects.filter(child=request.user).first()
        if not relation:
            return Response({"detail": "No parent found for this child."}, status=status.HTTP_400_BAD_REQUEST)
            
        parent = relation.parent
        
        if not parent.parent_pin:
            # If parent hasn't set a PIN, deny switching this way
            return Response({"detail": "Parent PIN not set. Please login via email."}, status=status.HTTP_400_BAD_REQUEST)

        if check_password(str(pin), parent.parent_pin):
            # Generate new tokens for the parent
            from rest_framework_simplejwt.tokens import RefreshToken
            refresh = RefreshToken.for_user(parent)
            
            return Response({
                "access": str(refresh.access_token),
                "refresh": str(refresh),
                "user": UserSerializer(parent).data
            })
            
        return Response({"detail": "Incorrect PIN."}, status=status.HTTP_400_BAD_REQUEST)
