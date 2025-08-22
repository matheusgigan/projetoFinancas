# pasta/users/urls.py

from django.urls import path
from .views import UserCreate, CurrentUserView
from rest_framework.authtoken.views import obtain_auth_token

urlpatterns = [
    path('register/', UserCreate.as_view(), name='register'),
    path('login/', obtain_auth_token, name='login'),
    path('me/', CurrentUserView.as_view(), name='current-user'),
]