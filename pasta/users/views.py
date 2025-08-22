# users/views.py

from rest_framework import generics, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from .serializers import UserSerializer

class UserCreate(generics.CreateAPIView):
    serializer_class = UserSerializer

# A CLASSE QUE ESTAVA FALTANDO:
class CurrentUserView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)