from django.shortcuts import render
# users/views.py

from rest_framework import generics
from .serializers import UserSerializer

# Usamos uma "Generic View" do DRF.
# A CreateAPIView já tem toda a lógica pronta para criar um objeto.
# Nós só precisamos dizer a ela qual Serializer usar.
class UserCreate(generics.CreateAPIView):
    serializer_class = UserSerializer
# Create your views here.
