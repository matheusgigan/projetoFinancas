# core/views.py

from rest_framework import viewsets, permissions
from .models import Grupo, Despesa
from .serializers import GrupoSerializer, DespesaSerializer
from rest_framework.exceptions import ValidationError
from rest_framework.exceptions import PermissionDenied

# FONTE DO ERRO: Faltava esta classe inteira!
class GrupoViewSet(viewsets.ModelViewSet):
    serializer_class = GrupoSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """
        Garante que um usuário só possa ver os grupos dos quais ele é membro.
        """
        return self.request.user.grupos_participantes.all()

    def perform_create(self, serializer):
        """
        Define o 'criador' do grupo como o usuário que fez a requisição
        e o adiciona automaticamente à lista de membros.
        """
        grupo = serializer.save(criador=self.request.user)
        grupo.membros.add(self.request.user)


# A sua classe DespesaViewSet vem logo abaixo, como já estava.
class DespesaViewSet(viewsets.ModelViewSet):
    serializer_class = DespesaSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_grupo(self):
        """
        Método auxiliar para buscar o grupo e verificar a permissão do usuário.
        Falha imediatamente com um erro 403 se o usuário não for membro.
        """
        # 1. Pega o ID do grupo que veio na URL.
        grupo_id = self.kwargs['grupo_pk']
        try:
            # 2. Tenta buscar o grupo DIRETAMENTE na lista de grupos do usuário.
            grupo = self.request.user.grupos_participantes.get(pk=grupo_id)
            return grupo
        except Grupo.DoesNotExist:
            # 3. Se não encontrou, levanta um erro de Permissão Negada.
            raise PermissionDenied("Você não tem permissão para acessar este grupo.")

    def get_queryset(self):
        """
        A lógica de LEITURA agora apenas usa o método auxiliar.
        """
        grupo = self.get_grupo()
        return grupo.despesas.all()

    def perform_create(self, serializer):
        """
        A lógica de ESCRITA agora apenas usa o método auxiliar.
        """
        grupo = self.get_grupo()
        serializer.save(pago_por=self.request.user, grupo=grupo)