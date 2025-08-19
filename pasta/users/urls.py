# users/urls.py

from django.urls import path
from .views import UserCreate
from rest_framework.authtoken.views import obtain_auth_token

urlpatterns = [
    # Endpoint para um novo usuário se registrar
    path('register/', UserCreate.as_view(), name='register'),
    # Endpoint para um usuário fazer login e obter um token
    path('login/', obtain_auth_token, name='login'),
]