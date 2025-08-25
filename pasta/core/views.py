from decimal import Decimal
from datetime import date
from django.db.models import Sum
from django.contrib.auth.models import User
from rest_framework.views import APIView
from django.views.generic import TemplateView

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
    MetaGrupoSerializer, ContribuicaoSerializer, PagamentoGastoFixoSerializer,
    MetaGrupoDashboardSerializer
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
            categoria_pagamento=gasto_fixo.categoria,
            mes=mes,
            ano=ano
        )

# --- NOVA VIEW PARA OS DADOS DO GRÁFICO ---
class ChartDataView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, *args, **kwargs):
        hoje = date.today()
        mes_atual = hoje.month
        ano_atual = hoje.year

        # Filtra os pagamentos e despesas do mês e ano atuais
        pagamentos = PagamentoGastoFixo.objects.filter(
            usuario=request.user, mes=mes_atual, ano=ano_atual
        )
        despesas_grupo = Despesa.objects.filter(
            grupo__membros=request.user, 
            data_despesa__month=mes_atual, 
            data_despesa__year=ano_atual
        )

        dados_agrupados = {}

        # Agrupa os pagamentos pela sua categoria histórica
        for pagamento in pagamentos:
            categoria = pagamento.get_categoria_pagamento_display()
            dados_agrupados.setdefault(categoria, Decimal(0))
            dados_agrupados[categoria] += pagamento.valor_pagamento

        # Agrupa as despesas de grupo pela sua categoria
        for despesa in despesas_grupo:
            categoria = despesa.get_categoria_display()
            dados_agrupados.setdefault(categoria, Decimal(0))
            dados_agrupados[categoria] += despesa.valor

        categorias_ordenadas = sorted(dados_agrupados.items(), key=lambda item: item[1], reverse=True)

        labels = [item[0] for item in categorias_ordenadas]
        data = [item[1] for item in categorias_ordenadas]

        return Response({'labels': labels, 'data': data})
    
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
    
class LoginView(TemplateView):
    template_name = "index.html"

class HomeView(TemplateView):
    template_name = "home.html"

class RegisterView(TemplateView):
    template_name = "register.html"

class AdicionarView(TemplateView):
    template_name = "adicionar.html"

class GastosView(TemplateView):
    template_name = "gastos.html"

class MetasView(TemplateView):
    template_name = "metas.html"

class GruposView(TemplateView):
    template_name = "grupos.html"

class MetaDetalheView(TemplateView):
    template_name = "meta_detalhe.html"

class GrupoDetalheView(TemplateView):
    template_name = "grupo_detalhe.html"

class CalendarioView(TemplateView):
    template_name = "calendario.html"

class RelatorioView(TemplateView):
    template_name = "relatorio.html"

class RendasView(TemplateView):
    template_name = "rendas.html"

class MenuView(TemplateView):
    template_name = "menu.html"

class EstatisticasView(TemplateView):
    template_name = "estatisticas.html"

class MetaGrupoDetalheView(TemplateView):
    template_name = "meta_grupo_detalhe.html"


class MetaGrupoViewSet(viewsets.ModelViewSet):
    serializer_class = MetaGrupoSerializer # Usa o serializer COMPLETO
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """
        LÓGICA DE BUSCA CORRIGIDA E EXPLÍCITA
        """
        grupo_id = self.kwargs.get('grupo_pk')
        # 1. Pega os grupos do usuário
        meus_grupos = self.request.user.grupos_participantes.all()
        # 2. Se o grupo pedido não está na lista de grupos do usuário, não retorna nada
        if not meus_grupos.filter(pk=grupo_id).exists():
            return MetaGrupo.objects.none()
        # 3. Se está na lista, retorna as metas daquele grupo
        return MetaGrupo.objects.filter(grupo_id=grupo_id)

    def perform_create(self, serializer):
        # Esta função já estava correta
        grupo_id = self.kwargs['grupo_pk']
        grupo = Grupo.objects.get(pk=grupo_id)
        if self.request.user not in grupo.membros.all():
            raise PermissionDenied("Você não pode criar metas neste grupo.")
        serializer.save(criado_por=self.request.user, grupo=grupo)


class MinhasMetasGrupoViewSet(viewsets.ReadOnlyModelViewSet):
    # Continua usando o serializer SIMPLES para o dashboard
    serializer_class = MetaGrupoDashboardSerializer 
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """
        LÓGICA DE BUSCA CORRIGIDA E EXPLÍCITA
        """
        # 1. Pega todos os IDs dos grupos em que o usuário é membro
        ids_dos_meus_grupos = self.request.user.grupos_participantes.values_list('id', flat=True)
        # 2. Retorna todas as metas que pertencem a qualquer um desses grupos
        return MetaGrupo.objects.filter(grupo_id__in=ids_dos_meus_grupos)