# core/serializers.py
from rest_framework import serializers
from .models import Grupo, Despesa # Verifique se os dois estão aqui

class GrupoSerializer(serializers.ModelSerializer):
    criador = serializers.ReadOnlyField(source='criador.username')
    membros = serializers.StringRelatedField(many=True, read_only=True)

    class Meta:
        model = Grupo
        fields = ['id', 'nome_grupo', 'criador', 'membros', 'criado_em']

# --- Nosso novo código começa aqui ---
class DespesaSerializer(serializers.ModelSerializer):
    pago_por = serializers.ReadOnlyField(source='pago_por.username')

    class Meta:
        model = Despesa
        fields = ['id', 'descricao', 'valor', 'data_despesa', 'pago_por', 'grupo']
        read_only_fields = ['grupo']