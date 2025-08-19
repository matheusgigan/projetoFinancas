from rest_framework import viewsets, permissions
# Adicione os novos modelos
from rest_framework.decorators import action # Adicione esta importação
from rest_framework.response import Response # Adicione esta importação
from rest_framework import status # Adicione esta importação
from .models import Grupo, Despesa, GastoFixo, MetaPessoal, Renda, DepositoMeta
# Adicione os novos serializers
from .serializers import GrupoSerializer, DespesaSerializer, GastoFixoSerializer, MetaPessoalSerializer, RendaSerializer, DepositoMetaSerializer
from rest_framework.exceptions import PermissionDenied
from decimal import Decimal

class GrupoViewSet(viewsets.ModelViewSet):
    serializer_class = GrupoSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """
        ESTA FUNÇÃO É A CORREÇÃO.
        Ela sobrescreve o comportamento padrão (que é mostrar tudo)
        e filtra a lista de grupos para retornar APENAS
        aqueles dos quais o usuário logado é um membro.
        """
        return self.request.user.grupos_participantes.all()

    def perform_create(self, serializer):
        """
        Esta parte já estava correta. Garante que, ao criar um grupo,
        o criador é adicionado como membro.
        """
        grupo = serializer.save(criador=self.request.user)
        grupo.membros.add(self.request.user)

class DespesaViewSet(viewsets.ModelViewSet):
    serializer_class = DespesaSerializer
    permission_classes = [permissions.IsAuthenticated]
    def get_grupo(self):
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
    serializer_class = GastoFixoSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Retorna apenas os gastos fixos do usuário logado.
        return self.request.user.gastos_fixos.all()

    def perform_create(self, serializer):
        # Associa o novo gasto fixo ao usuário logado.
        serializer.save(usuario=self.request.user)


class MetaPessoalViewSet(viewsets.ModelViewSet):
    serializer_class = MetaPessoalSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return self.request.user.metas_pessoais.all()

    def perform_create(self, serializer):
        serializer.save(usuario=self.request.user)

    # --- NOVA AÇÃO DE DEPÓSITO COMEÇA AQUI ---
    @action(detail=True, methods=['post'])
    def depositar(self, request, pk=None):
        meta = self.get_object()
        valor_deposito_str = request.data.get('valor')

        if valor_deposito_str is None:
            return Response(...) # ... (lógica de erro continua a mesma)

        try:
            valor_deposito = Decimal(valor_deposito_str)
            if valor_deposito <= 0: raise ValueError()
        except (ValueError, TypeError):
            return Response(...) # ... (lógica de erro continua a mesma)

        # 1. ATUALIZA O VALOR TOTAL NA META (como antes)
        meta.valor_atual += valor_deposito
        meta.save()

        # 2. CRIA UM REGISTRO DA TRANSAÇÃO (a nova lógica)
        DepositoMeta.objects.create(meta=meta, valor=valor_deposito)

        serializer = self.get_serializer(meta)
        return Response(serializer.data)


class RendaViewSet(viewsets.ModelViewSet):
    serializer_class = RendaSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Retorna apenas as rendas do usuário logado.
        return self.request.user.rendas.all()

    def perform_create(self, serializer):
        # Associa a nova renda ao usuário logado.
        serializer.save(usuario=self.request.user)

class DepositoMetaViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = DepositoMetaSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Retorna todos os depósitos de todas as metas do usuário logado
        return DepositoMeta.objects.filter(meta__usuario=self.request.user)