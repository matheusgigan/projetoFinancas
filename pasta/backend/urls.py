# backend/urls.py

from django.contrib import admin
from django.urls import path, include
from django.views.generic import TemplateView, RedirectView

urlpatterns = [
    # Rotas para servir cada página HTML do seu frontend
    path('', TemplateView.as_view(template_name="index.html"), name='login-page'),
    path('index.html', RedirectView.as_view(url='/', permanent=True)),
    path('home.html', TemplateView.as_view(template_name="home.html"), name='home-page'),
    path('register.html', TemplateView.as_view(template_name="register.html"), name='register-page'),
    path('adicionar.html', TemplateView.as_view(template_name="adicionar.html"), name='add-page'),
    path('gastos.html', TemplateView.as_view(template_name="gastos.html"), name='gastos-page'),
    path('metas.html', TemplateView.as_view(template_name="metas.html"), name='metas-page'),
    path('grupos.html', TemplateView.as_view(template_name="grupos.html"), name='grupos-page'),
    path('meta_detalhe.html', TemplateView.as_view(template_name="meta_detalhe.html"), name='meta-detail-page'),
    path('grupo_detalhe.html', TemplateView.as_view(template_name="grupo_detalhe.html"), name='grupo-detail-page'),
    path('meta_grupo_detalhe.html', TemplateView.as_view(template_name="meta_grupo_detalhe.html"), name='meta-grupo-detail-page'),
    path('calendario.html', TemplateView.as_view(template_name="calendario.html"), name='calendario-page'),
    path('relatorio.html', TemplateView.as_view(template_name="relatorio.html"), name='relatorio-page'),
    path('estatisticas.html', TemplateView.as_view(template_name="estatisticas.html"), name='estatisticas-page'),
    path('menu.html', TemplateView.as_view(template_name="menu.html"), name='menu-page'),

    # Rotas do Backend API (sem mudanças)
    path('admin/', admin.site.urls),
    path('api/auth/', include('users.urls')),
    path('api/', include('core.urls')),

    # Fluxo de Redefinição de Senha do Django (sem mudanças)
    path('accounts/', include('django.contrib.auth.urls')),
]