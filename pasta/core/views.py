from decimal import Decimal
from datetime import date
from django.db.models import Sum
from django.contrib.auth.models import User
from rest_framework.views import APIView

from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.response import Response

from .models import (
    Grupo, Despesa, GastoFixo, MetaPessoal, Renda, DepositoMeta, 
    MetaGrupo, Contribuicao, PagamentoGastoFixo
)
from .serializers import (
    GrupoSerializer, DespesaSerializer, GastoFixoSerializer, 
    MetaPessoalSerializer, RendaSerializer, DepositoMetaSerializer,
    MetaGrupoSerializer, ContribuicaoSerializer, PagamentoGastoFixoSerializer
)


class GrupoViewSet(viewsets.ModelViewSet):
    serializer_class = GrupoSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return self.request.user.grupos_participantes.all()

    def perform_create(self, serializer):
        grupo = serializer.save(criador=self.request.user)
        grupo.membros.add(self.request.user)

    # --- NOVA AÇÃO DE CONVITE COMEÇA AQUI ---
    @action(detail=True, methods=['post'])
    def convidar(self, request, pk=None):
        grupo = self.get_object() # Pega o grupo (ex: /api/grupos/1/)

        # 1. Checagem de Permissão: Apenas o criador do grupo pode convidar
        if request.user != grupo.criador:
            return Response(
                {'erro': 'Apenas o criador do grupo pode convidar novos membros.'},
                status=status.HTTP_403_FORBIDDEN
            )

        # 2. Pega o username enviado pelo frontend
        username_a_convidar = request.data.get('username')
        if not username_a_convidar:
            return Response({'erro': 'O nome do usuário é obrigatório.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # 3. Encontra o usuário no banco de dados
            usuario_a_convidar = User.objects.get(username=username_a_convidar)
        except User.DoesNotExist:
            return Response({'erro': f"Usuário '{username_a_convidar}' não encontrado."}, status=status.HTTP_404_NOT_FOUND)

        # 4. Checagens de Lógica
        if usuario_a_convidar in grupo.membros.all():
            return Response({'erro': f"O usuário '{username_a_convidar}' já é membro deste grupo."}, status=status.HTTP_400_BAD_REQUEST)

        if usuario_a_convidar == request.user:
            return Response({'erro': 'Você não pode se convidar.'}, status=status.HTTP_400_BAD_REQUEST)

        # 5. Adiciona o usuário ao grupo
        grupo.membros.add(usuario_a_convidar)

        return Response(
            {'sucesso': f"Usuário '{username_a_convidar}' adicionado ao grupo!"},
            status=status.HTTP_200_OK
        )


class DespesaViewSet(viewsets.ModelViewSet):
    """
    API para gerenciar Despesas dentro de um Grupo (aninhada).
    """
    serializer_class = DespesaSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_grupo(self):
        # Método auxiliar para buscar o grupo da URL e checar permissão.
        grupo_id = self.kwargs['grupo_pk']
        try:
            grupo = self.request.user.grupos_participantes.get(pk=grupo_id)
            return grupo
        except Grupo.DoesNotExist:
            raise PermissionDenied("Você não tem permissão para acessar este grupo.")

    def get_queryset(self):
        grupo = self.get_grupo()
        return grupo.despesas.all()

    def perform_create(self, serializer):
        grupo = self.get_grupo()
        serializer.save(pago_por=self.request.user, grupo=grupo)


class GastoFixoViewSet(viewsets.ModelViewSet):
    """
    API para gerenciar Gastos Fixos pessoais.
    """
    serializer_class = GastoFixoSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return self.request.user.gastos_fixos.all()

    def perform_create(self, serializer):
        serializer.save(usuario=self.request.user)


class MetaPessoalViewSet(viewsets.ModelViewSet):
    """
    API para gerenciar Metas Pessoais.
    """
    serializer_class = MetaPessoalSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return self.request.user.metas_pessoais.all()

    def perform_create(self, serializer):
        serializer.save(usuario=self.request.user)

    @action(detail=True, methods=['post'])
    def depositar(self, request, pk=None):
        meta = self.get_object()
        valor_deposito_str = request.data.get('valor')

        if valor_deposito_str is None:
            return Response({'erro': 'O valor do depósito é obrigatório.'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            valor_deposito = Decimal(valor_deposito_str)
            if valor_deposito <= 0: raise ValueError()
        except (ValueError, TypeError):
            return Response({'erro': 'O valor do depósito deve ser um número positivo.'}, status=status.HTTP_400_BAD_REQUEST)
        
        meta.valor_atual += valor_deposito
        meta.save()
        DepositoMeta.objects.create(meta=meta, valor=valor_deposito)
        serializer = self.get_serializer(meta)
        return Response(serializer.data)


class RendaViewSet(viewsets.ModelViewSet):
    """
    API para gerenciar Rendas pessoais.
    """
    serializer_class = RendaSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return self.request.user.rendas.all()

    def perform_create(self, serializer):
        serializer.save(usuario=self.request.user)


class DepositoMetaViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API somente leitura para listar depósitos em metas.
    """
    serializer_class = DepositoMetaSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return DepositoMeta.objects.filter(meta__usuario=self.request.user)


class MetaGrupoViewSet(viewsets.ModelViewSet):
    """
    API para gerenciar Metas de Grupo (Vaquinhas), aninhada em Grupos.
    """
    serializer_class = MetaGrupoSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        grupo_id = self.kwargs['grupo_pk']
        if self.request.user.grupos_participantes.filter(pk=grupo_id).exists():
            return MetaGrupo.objects.filter(grupo_id=grupo_id)
        return MetaGrupo.objects.none()

    def perform_create(self, serializer):
        grupo_id = self.kwargs['grupo_pk']
        grupo = Grupo.objects.get(pk=grupo_id)
        if self.request.user not in grupo.membros.all():
            raise PermissionDenied("Você não pode criar metas neste grupo.")
        serializer.save(criado_por=self.request.user, grupo=grupo)


class ContribuicaoViewSet(viewsets.ModelViewSet):
    """
    API para gerenciar Contribuições em Metas de Grupo, aninhada em Metas.
    """
    serializer_class = ContribuicaoSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        meta_id = self.kwargs['meta_pk']
        meta = MetaGrupo.objects.get(pk=meta_id)
        if self.request.user in meta.grupo.membros.all():
            return Contribuicao.objects.filter(meta_grupo_id=meta_id)
        return Contribuicao.objects.none()

    def perform_create(self, serializer):
        meta_id = self.kwargs['meta_pk']
        meta = MetaGrupo.objects.get(pk=meta_id)
        if self.request.user not in meta.grupo.membros.all():
            raise PermissionDenied("Você não pode contribuir para esta meta.")
        
        # O frontend nos envia apenas o 'valor'
        valor_contribuicao = Decimal(self.request.data.get('valor'))
        meta.valor_atual += valor_contribuicao
        meta.save()
        
        # O backend preenche os campos restantes
        serializer.save(
            usuario=self.request.user, 
            meta_grupo=meta,
            valor_contribuicao=valor_contribuicao,
            descricao_contribuicao=f"Contribuição para '{meta.nome}'"
        )


class MinhasContribuicoesViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API somente leitura para listar todas as contribuições de um usuário.
    """
    serializer_class = ContribuicaoSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Contribuicao.objects.filter(usuario=self.request.user)


class PagamentoGastoFixoViewSet(viewsets.ModelViewSet):
    serializer_class = PagamentoGastoFixoSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return PagamentoGastoFixo.objects.filter(usuario=self.request.user)

    def perform_create(self, serializer):
        gasto_fixo_id = self.request.data.get('gasto_fixo_id')
        gasto_fixo = GastoFixo.objects.get(id=gasto_fixo_id, usuario=self.request.user)
        hoje = date.today()
        mes = hoje.month
        ano = hoje.year

        if PagamentoGastoFixo.objects.filter(gasto_fixo=gasto_fixo, mes=mes, ano=ano).exists():
            raise ValidationError("Este gasto já foi pago este mês.")

        # A categoria não é mais salva aqui
        serializer.save(
            gasto_fixo=gasto_fixo,
            usuario=self.request.user,
            descricao_pagamento=gasto_fixo.descricao,
            valor_pagamento=gasto_fixo.valor,
            mes=mes,
            ano=ano
        )

# --- NOVA VIEW PARA OS DADOS DO GRÁFICO ---
class ChartDataView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, *args, **kwargs):
        dados_agrupados = {}

        # 1. Soma os PAGAMENTOS DE GASTOS FIXOS por categoria
        pagamentos = PagamentoGastoFixo.objects.filter(
            usuario=request.user,
            gasto_fixo__isnull=False
        )
        for pagamento in pagamentos:
            # Usamos .get_categoria_display() para pegar o nome amigável (ex: "Moradia")
            categoria = pagamento.gasto_fixo.get_categoria_display()
            if categoria not in dados_agrupados:
                dados_agrupados[categoria] = 0
            dados_agrupados[categoria] += pagamento.valor_pagamento

        # 2. Soma as DESPESAS DE GRUPO por categoria
        despesas_de_grupo = Despesa.objects.filter(
            grupo__membros=request.user # Busca despesas de grupos que o usuário participa
        )
        for despesa in despesas_de_grupo:
            categoria = despesa.get_categoria_display()
            if categoria not in dados_agrupados:
                dados_agrupados[categoria] = 0
            # Consideramos que o valor da despesa de grupo é dividido igualmente
            # (Esta é uma simplificação, poderíamos tornar mais complexo no futuro)
            # valor_individual = despesa.valor / despesa.grupo.membros.count()
            # Por enquanto, vamos somar o valor total da despesa para o gráfico
            dados_agrupados[categoria] += despesa.valor

        # 3. Formata os dados para o Chart.js
        # Ordena as categorias da que tem o maior gasto para a menor
        categorias_ordenadas = sorted(dados_agrupados.items(), key=lambda item: item[1], reverse=True)

        labels = [item[0] for item in categorias_ordenadas]
        data = [item[1] for item in categorias_ordenadas]

        response_data = {
            'labels': labels,
            'data': data
        }
        return Response(response_data)
    
# --- NOVA VIEW PARA O EXTRATO UNIFICADO ---
class ExtratoView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, *args, **kwargs):
        usuario = request.user
        transacoes = []

        # 1. Pega todas as Rendas
        rendas = Renda.objects.filter(usuario=usuario)
        for renda in rendas:
            transacoes.append({
                'data': renda.data,
                'descricao': renda.descricao,
                'valor': renda.valor,
                'tipo': 'Renda'
            })

        # 2. Pega todos os Pagamentos de Gastos Fixos
        pagamentos = PagamentoGastoFixo.objects.filter(usuario=usuario)
        for pagamento in pagamentos:
            transacoes.append({
                'data': pagamento.data_pagamento,
                'descricao': pagamento.descricao_pagamento,
                'valor': -pagamento.valor_pagamento, # Valor negativo, pois é uma saída
                'tipo': 'Pagamento'
            })

        # 3. Pega todos os Depósitos em Metas Pessoais
        depositos = DepositoMeta.objects.filter(meta__usuario=usuario)
        for deposito in depositos:
            transacoes.append({
                'data': deposito.data,
                'descricao': f"Depósito na meta '{deposito.meta.nome}'",
                'valor': -deposito.valor, # Valor negativo
                'tipo': 'Poupança'
            })

        # 4. Pega todas as Contribuições em Metas de Grupo
        contribuicoes = Contribuicao.objects.filter(usuario=usuario)
        for contribuicao in contribuicoes:
            transacoes.append({
                'data': contribuicao.data.date(), # Pega apenas a data do DateTimeField
                'descricao': contribuicao.descricao_contribuicao,
                'valor': -contribuicao.valor_contribuicao, # Valor negativo
                'tipo': 'Contribuição'
            })

        # 5. Ordena todas as transações pela data, da mais recente para a mais antiga
        transacoes_ordenadas = sorted(transacoes, key=lambda t: t['data'], reverse=True)

        return Response(transacoes_ordenadas)