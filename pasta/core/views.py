from rest_framework import viewsets, permissions
from .models import Grupo, Despesa
from .serializers import GrupoSerializer, DespesaSerializer
from rest_framework.exceptions import PermissionDenied

class GrupoViewSet(viewsets.ModelViewSet):
    serializer_class = GrupoSerializer
    permission_classes = [permissions.IsAuthenticated]
    def get_queryset(self):
        return self.request.user.grupos_participantes.all()
    def perform_create(self, serializer):
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