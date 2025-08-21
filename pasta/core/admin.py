# core/admin.py

from django.contrib import admin
from .models import (
    Grupo, 
    Despesa, 
    GastoFixo, 
    MetaPessoal, 
    Renda, 
    DepositoMeta, 
    MetaGrupo, 
    Contribuicao, 
    PagamentoGastoFixo
)

# 1. Definimos nossa classe de customização para o Admin do Grupo
class GrupoAdmin(admin.ModelAdmin):
    filter_horizontal = ('membros',)
    # A CORREÇÃO ESTÁ AQUI:
    list_display = ('nome_grupo', 'criador', 'criado_em') 

# 2. Agora, registramos todos os modelos

# Registramos o Grupo USANDO a nossa classe customizada
admin.site.register(Grupo, GrupoAdmin)

# Registramos todos os outros modelos da forma simples
admin.site.register(Despesa)
admin.site.register(GastoFixo)
admin.site.register(MetaPessoal)
admin.site.register(Renda)
admin.site.register(DepositoMeta)
admin.site.register(MetaGrupo)
admin.site.register(Contribuicao)
admin.site.register(PagamentoGastoFixo)