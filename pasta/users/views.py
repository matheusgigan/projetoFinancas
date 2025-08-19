from rest_framework import generics
from .serializers import UserSerializer

class UserCreate(generics.CreateAPIView):
    serializer_class = UserSerializer