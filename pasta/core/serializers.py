from rest_framework import serializers
from .models import Grupo, Despesa

class GrupoSerializer(serializers.ModelSerializer):
    criador = serializers.ReadOnlyField(source='criador.username')
    membros = serializers.StringRelatedField(many=True, read_only=True)
    class Meta:
        model = Grupo
        fields = ['id', 'nome_grupo', 'criador', 'membros', 'criado_em']

class DespesaSerializer(serializers.ModelSerializer):
    pago_por = serializers.ReadOnlyField(source='pago_por.username')
    class Meta:
        model = Despesa
        fields = ['id', 'descricao', 'valor', 'data_despesa', 'pago_por', 'grupo']
        read_only_fields = ['grupo']