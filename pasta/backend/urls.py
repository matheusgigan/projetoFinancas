# backend/urls.py

from django.contrib import admin
from django.urls import path, include
# Importa todas as nossas novas Views de página
from core.views import (
    LoginView, HomeView, RegisterView, AdicionarView,
    GastosView, MetasView, GruposView, MetaDetalheView,
    GrupoDetalheView, CalendarioView, RelatorioView
)

urlpatterns = [
    # Rotas das Páginas HTML
    path('', LoginView.as_view(), name='login-page'),
    path('home.html', HomeView.as_view(), name='home-page'),
    path('register.html', RegisterView.as_view(), name='register-page'),
    path('adicionar.html', AdicionarView.as_view(), name='add-page'),
    path('gastos.html', GastosView.as_view(), name='gastos-page'),
    path('metas.html', MetasView.as_view(), name='metas-page'),
    path('grupos.html', GruposView.as_view(), name='grupos-page'),
    path('meta_detalhe.html', MetaDetalheView.as_view(), name='meta-detail-page'),
    path('grupo_detalhe.html', GrupoDetalheView.as_view(), name='grupo-detail-page'),
    path('calendario.html', CalendarioView.as_view(), name='calendario-page'),
    path('relatorio.html', RelatorioView.as_view(), name='relatorio-page'),

    # Rotas do Backend
    path('admin/', admin.site.urls),
    path('api/auth/', include('users.urls')),
    path('api/', include('core.urls')),
]