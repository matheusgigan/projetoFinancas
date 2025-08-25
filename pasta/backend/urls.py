# backend/urls.py

from django.contrib import admin
from django.urls import path, include
from django.views.generic import RedirectView
from users.views import CustomPasswordResetView # Nossa nova view!
from django.contrib.auth import views as auth_views # Views padrão do Django
# Importa todas as nossas novas Views de página
from core.views import (
    LoginView, HomeView, RegisterView,
    GastosView, MetasView, GruposView, MetaDetalheView,
    GrupoDetalheView, CalendarioView, RelatorioView, RendasView, MenuView, EstatisticasView, MetaGrupoDetalheView
)

urlpatterns = [
    # Rotas das Páginas HTML
    path('', LoginView.as_view(), name='login-page'),
    path('index.html', RedirectView.as_view(url='/', permanent=True)),
    path('home.html', HomeView.as_view(), name='home-page'),
    path('register.html', RegisterView.as_view(), name='register-page'),
    path('gastos.html', GastosView.as_view(), name='gastos-page'),
    path('metas.html', MetasView.as_view(), name='metas-page'),
    path('grupos.html', GruposView.as_view(), name='grupos-page'),
    path('rendas.html', RendasView.as_view(), name='rendas-page'),
    path('meta_detalhe.html', MetaDetalheView.as_view(), name='meta-detail-page'),
    path('grupo_detalhe.html', GrupoDetalheView.as_view(), name='grupo-detail-page'),
    path('calendario.html', CalendarioView.as_view(), name='calendario-page'),
    path('relatorio.html', RelatorioView.as_view(), name='relatorio-page'),
    path('estatisticas.html', EstatisticasView.as_view(), name='estatisticas-page'), # Rota para Estatísticas
    path('menu.html', MenuView.as_view(), name='menu-page'), # Rota para o Menu
    path('meta_grupo_detalhe.html', MetaGrupoDetalheView.as_view(), name='meta-grupo-detail-page'),

    # Rotas do Backend
    path('admin/', admin.site.urls),
    path('api/auth/', include('users.urls')),
    path('api/', include('core.urls')),



    # --- FLUXO DE REDEFINIÇÃO DE SENHA (AGORA EXPLÍCITO) ---
    path(
        'accounts/password_reset/', 
        CustomPasswordResetView.as_view(), 
        name='password_reset'
    ),
    path(
        'accounts/password_reset/done/', 
        auth_views.PasswordResetDoneView.as_view(template_name='registration/password_reset_done.html'),
        name='password_reset_done'
    ),
    path(
        'accounts/reset/<uidb64>/<token>/',
        auth_views.PasswordResetConfirmView.as_view(template_name='registration/password_reset_confirm.html'),
        name='password_reset_confirm'
    ),
    path(
        'accounts/reset/done/',
        auth_views.PasswordResetCompleteView.as_view(template_name='registration/password_reset_complete.html'),
        name='password_reset_complete'
    ),
]
