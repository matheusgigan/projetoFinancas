# users/views.py

from django.shortcuts import render
from rest_framework import generics, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from .serializers import UserSerializer
from django.contrib.auth.views import PasswordResetView
from django.contrib.auth.models import User

# --- NOVAS IMPORTAÇÕES NECESSÁRIAS ---
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes


class UserCreate(generics.CreateAPIView):
    serializer_class = UserSerializer

class CurrentUserView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

# --- VIEW CUSTOMIZADA (VERSÃO CORRIGIDA) ---
class CustomPasswordResetView(PasswordResetView):
    email_template_name = 'registration/password_reset_email.html'
    subject_template_name = 'registration/password_reset_subject.txt'
    
    def form_valid(self, form):
        opts = {
            'use_https': self.request.is_secure(),
            'token_generator': self.token_generator,
            'from_email': self.from_email,
            'email_template_name': self.email_template_name,
            'subject_template_name': self.subject_template_name,
            'request': self.request,
        }
        
        user_email = form.cleaned_data['email']
        user = User.objects.get(email=user_email)
        
        context = {
            'email': user.email,
            'domain': self.request.get_host(),
            'site_name': 'App Finanças',
            'user': user,
            # A LINHA CORRIGIDA: Usando a forma pública e correta de gerar o UID
            'uid': urlsafe_base64_encode(force_bytes(user.pk)),
            'token': opts['token_generator'].make_token(user),
            'protocol': 'https' if self.request.is_secure() else 'http',
        }
        
        subject = render_to_string(self.subject_template_name, context)
        subject = ''.join(subject.splitlines())
        html_content = render_to_string(self.email_template_name, context)
        text_content = strip_tags(html_content)
        
        email_message = EmailMultiAlternatives(subject, text_content, opts['from_email'], [user_email])
        email_message.attach_alternative(html_content, "text/html")
        email_message.send()
        
        return super().form_valid(form)