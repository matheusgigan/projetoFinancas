# users/serializers.py

from django.contrib.auth.models import User
from rest_framework import serializers

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        # Campos que serão usados no cadastro
        fields = ['username', 'email', 'password']
        # Garante que a senha não seja retornada na resposta (só para escrita)
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        # Este método é chamado quando um novo usuário é criado.
        # Usamos create_user para garantir que a senha seja salva de forma
        # segura (criptografada) e não como texto puro.
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password']
        )
        return user