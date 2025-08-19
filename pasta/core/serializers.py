# core/serializers.py
from rest_framework import serializers
from .models import Grupo, Despesa, GastoFixo, MetaPessoal, Renda, DepositoMeta

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

# --- SERIALIZER ATUALIZADO ---
class GastoFixoSerializer(serializers.ModelSerializer):
    usuario = serializers.ReadOnlyField(source='usuario.username')
    class Meta:
        model = GastoFixo
        # Alterado de 'dia_vencimento' para 'data_vencimento'
        fields = ['id', 'usuario', 'descricao', 'valor', 'data_vencimento']

class MetaPessoalSerializer(serializers.ModelSerializer):
    usuario = serializers.ReadOnlyField(source='usuario.username')
    class Meta:
        model = MetaPessoal
        fields = ['id', 'usuario', 'nome', 'valor_meta', 'valor_atual', 'data_criacao']

class RendaSerializer(serializers.ModelSerializer):
    usuario = serializers.ReadOnlyField(source='usuario.username')
    class Meta:
        model = Renda
        fields = ['id', 'usuario', 'descricao', 'valor', 'data', 'tipo']

class DepositoMetaSerializer(serializers.ModelSerializer):
    class Meta:
        model = DepositoMeta
        fields = ['id', 'meta', 'valor', 'data']