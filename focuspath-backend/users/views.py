from rest_framework import views, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import UserRoutine
from .serializers import UserRoutineSerializer

class UserRoutineView(views.APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        routine, created = UserRoutine.objects.get_or_create(user=request.user)
        serializer = UserRoutineSerializer(routine)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        routine, created = UserRoutine.objects.get_or_create(user=request.user)
        serializer = UserRoutineSerializer(routine, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def put(self, request):
        return self.post(request)
