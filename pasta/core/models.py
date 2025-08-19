from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone

class Grupo(models.Model):
    nome_grupo = models.CharField(max_length=100)
    criador = models.ForeignKey(User, related_name="grupos_criados", on_delete=models.CASCADE)
    membros = models.ManyToManyField(User, related_name="grupos_participantes")
    criado_em = models.DateTimeField(auto_now_add=True)
    def __str__(self): return self.nome_grupo

class Despesa(models.Model):
    descricao = models.CharField(max_length=200)
    valor = models.DecimalField(max_digits=10, decimal_places=2)
    data_despesa = models.DateField(default=timezone.now)
    grupo = models.ForeignKey(Grupo, on_delete=models.CASCADE, related_name='despesas')
    pago_por = models.ForeignKey(User, on_delete=models.CASCADE, related_name='despesas_pagas')
    def __str__(self): return f"{self.descricao} - R${self.valor}"