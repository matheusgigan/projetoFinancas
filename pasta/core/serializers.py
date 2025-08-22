# core/serializers.py
from rest_framework import serializers
from .models import Grupo, Despesa, GastoFixo, MetaPessoal, Renda, DepositoMeta, MetaGrupo, Contribuicao, PagamentoGastoFixo

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
        # Adicionamos 'categoria' à lista de campos
        fields = ['id', 'usuario', 'descricao', 'valor', 'data_vencimento', 'categoria']


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
    
class ContribuicaoSerializer(serializers.ModelSerializer):
    usuario = serializers.ReadOnlyField(source='usuario.username')
    class Meta:
        model = Contribuicao
        fields = ['id', 'usuario', 'valor_contribuicao', 'descricao_contribuicao', 'data']
        # A CORREÇÃO ESTÁ AQUI:
        read_only_fields = ['valor_contribuicao', 'descricao_contribuicao']
        
class MetaGrupoSerializer(serializers.ModelSerializer):
    criado_por = serializers.ReadOnlyField(source='criado_por.username')
    # Aninha o serializer de contribuições para mostrar a lista de quem contribuiu
    contribuicoes = ContribuicaoSerializer(many=True, read_only=True)
    class Meta:
        model = MetaGrupo
        fields = ['id', 'nome', 'valor_meta', 'valor_atual', 'criado_por', 'data_criacao', 'contribuicoes']

class PagamentoGastoFixoSerializer(serializers.ModelSerializer):
    # Estes campos garantem que a API sempre retorne os dados corretos
    descricao_pagamento = serializers.CharField(read_only=True)
    valor_pagamento = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    class Meta:
        model = PagamentoGastoFixo
        fields = ['id', 'gasto_fixo', 'data_pagamento', 'descricao_pagamento', 'valor_pagamento', 'categoria_pagamento']
        read_only_fields = ['gasto_fixo', 'descricao_pagamento', 'valor_pagamento', 'categoria_pagamento']