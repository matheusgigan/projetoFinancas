# core/models.py
from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
from datetime import date
from django.core.validators import MaxValueValidator, MinValueValidator




# NOVO: Definimos as categorias disponíveis
class CategoriaDespesa(models.TextChoices):
    MORADIA = 'MORADIA', 'Moradia'
    TRANSPORTE = 'TRANSPORTE', 'Transporte'
    ALIMENTACAO = 'ALIMENTACAO', 'Alimentação'
    SAUDE = 'SAUDE', 'Saúde'
    LAZER = 'LAZER', 'Lazer'
    OUTROS = 'OUTROS', 'Outros'
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
    categoria = models.CharField(
        max_length=20,
        choices=CategoriaDespesa.choices,
        default=CategoriaDespesa.OUTROS
    )
    def __str__(self): return f"{self.descricao} - R${self.valor}"

# --- MODELO ATUALIZADO ---
class GastoFixo(models.Model):
    usuario = models.ForeignKey(User, on_delete=models.CASCADE, related_name='gastos_fixos')
    descricao = models.CharField(max_length=100)
    valor = models.DecimalField(max_digits=10, decimal_places=2)
    data_vencimento = models.DateField(default=date.today)
    # O CAMPO CATEGORIA AGORA ESTÁ NO LUGAR CERTO:
    categoria = models.CharField(
        max_length=20,
        choices=CategoriaDespesa.choices,
        default=CategoriaDespesa.OUTROS
    )

    def __str__(self):
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

class MetaGrupo(models.Model):
    # MUDANÇA AQUI: Se o grupo for deletado, a meta fica sem grupo, mas não é deletada.
    grupo = models.ForeignKey(Grupo, on_delete=models.SET_NULL, null=True, related_name='metas')
    nome = models.CharField(max_length=100)
    valor_meta = models.DecimalField(max_digits=10, decimal_places=2)
    valor_atual = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    criado_por = models.ForeignKey(User, on_delete=models.CASCADE)
    data_criacao = models.DateField(auto_now_add=True)

    def __str__(self):
        return self.nome

class Contribuicao(models.Model):
    # MUDANÇA AQUI: Se a meta for deletada, a contribuição fica sem meta, mas não é deletada.
    meta_grupo = models.ForeignKey(MetaGrupo, on_delete=models.SET_NULL, null=True, related_name='contribuicoes')
    usuario = models.ForeignKey(User, on_delete=models.CASCADE)

    # NOVOS CAMPOS: Guardam a "foto" da contribuição
    valor_contribuicao = models.DecimalField(max_digits=10, decimal_places=2)
    descricao_contribuicao = models.CharField(max_length=200) # Ex: "Contribuição para Churrasco da Galera"

    data = models.DateTimeField(auto_now_add=True)

    # O campo 'valor' antigo não é mais necessário, usamos 'valor_contribuicao'
    # Se você tiver um campo 'valor', pode removê-lo ou renomeá-lo.

    def __str__(self):
        return f"R${self.valor_contribuicao} por {self.usuario.username} para {self.descricao_contribuicao}"
    
class PagamentoGastoFixo(models.Model):
    gasto_fixo = models.ForeignKey(GastoFixo, on_delete=models.SET_NULL, null=True, related_name='pagamentos')
    usuario = models.ForeignKey(User, on_delete=models.CASCADE)
    descricao_pagamento = models.CharField(max_length=100)
    valor_pagamento = models.DecimalField(max_digits=10, decimal_places=2)
    # O CAMPO CATEGORIA FOI REMOVIDO DAQUI
    data_pagamento = models.DateField(auto_now_add=True)
    mes = models.IntegerField()
    ano = models.IntegerField()

    def __str__(self):
        if self.gasto_fixo:
            return f"Pagamento de {self.gasto_fixo.descricao} em {self.data_pagamento.strftime('%d/%m/%Y')}"
        return f"Pagamento de Gasto Fixo deletado em {self.data_pagamento.strftime('%d/%m/%Y')}"


