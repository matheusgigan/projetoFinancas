# core/models.py
from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
from datetime import date
from django.core.validators import MaxValueValidator, MinValueValidator

class Grupo(models.Model):
    nome_grupo = models.CharField(max_length=100)
    criador = models.ForeignKey(User, related_name="grupos_criados", on_delete=models.CASCADE)
    membros = models.ManyToManyField(User, related_name="grupos_participantes")
    criado_em = models.DateTimeField(auto_now_add=True)
    def __str__(self): return self.nome_grupo

class Despesa(models.Model):
    descricao = models.CharField(max_length=200)
    valor = models.DecimalField(max_digits=10, decimal_places=2)
    data_despesa = models.DateField(default=date.today)
    grupo = models.ForeignKey(Grupo, on_delete=models.CASCADE, related_name='despesas')
    pago_por = models.ForeignKey(User, on_delete=models.CASCADE, related_name='despesas_pagas')
    def __str__(self): return f"{self.descricao} - R${self.valor}"

# --- MODELO ATUALIZADO ---
class GastoFixo(models.Model):
    usuario = models.ForeignKey(User, on_delete=models.CASCADE, related_name='gastos_fixos')
    descricao = models.CharField(max_length=100)
    valor = models.DecimalField(max_digits=10, decimal_places=2)
    # Alterado de IntegerField para DateField
    data_vencimento = models.DateField(default=date.today)

    def __str__(self):
        # Atualizado para mostrar a data formatada
        return f"{self.descricao} - Vence em {self.data_vencimento.strftime('%d/%m/%Y')}"

class MetaPessoal(models.Model):
    usuario = models.ForeignKey(User, on_delete=models.CASCADE, related_name='metas_pessoais')
    nome = models.CharField(max_length=100)
    valor_meta = models.DecimalField(max_digits=10, decimal_places=2)
    valor_atual = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    data_criacao = models.DateField(auto_now_add=True)
    def __str__(self): return self.nome

class Renda(models.Model):
    class TipoRenda(models.TextChoices):
        FIXA = 'FIXA', 'Fixa'
        EXTRA = 'EXTRA', 'Extra'

    usuario = models.ForeignKey(User, on_delete=models.CASCADE, related_name='rendas')
    descricao = models.CharField(max_length=100)
    valor = models.DecimalField(max_digits=10, decimal_places=2)
    # ALTERE A LINHA ABAIXO:
    data = models.DateField(default=date.today) # TROQUE timezone.now por date.today
    tipo = models.CharField(
        max_length=5,
        choices=TipoRenda.choices,
        default=TipoRenda.FIXA
    )

    def __str__(self):
        return f"{self.descricao} - R${self.valor}"

class DepositoMeta(models.Model):
    meta = models.ForeignKey(MetaPessoal, on_delete=models.CASCADE, related_name='depositos')
    valor = models.DecimalField(max_digits=10, decimal_places=2)
    data = models.DateField(auto_now_add=True)
    def __str__(self): return f"Deposito de R${self.valor} em {self.meta.nome}"