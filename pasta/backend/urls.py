# backend/urls.py

from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),

    # URLs de Autenticação para o seu app Kivy (Token)
    path('api/auth/', include('users.urls')),

    # URLs da Lógica Principal (Grupos, Despesas, etc.)
    path('api/', include('core.urls')),

    # URL para Login/Logout na API Navegável (Sessão do Navegador)
    path('api-auth/', include('rest_framework.urls')),
]