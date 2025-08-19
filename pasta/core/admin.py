# core/admin.py

from django.contrib import admin
# Importe todos os seus modelos do app core
from .models import Grupo, Despesa, GastoFixo, MetaPessoal, Renda

# Registra cada modelo para que ele apareça na interface de administração
admin.site.register(Grupo)
admin.site.register(Despesa)
admin.site.register(GastoFixo)
admin.site.register(MetaPessoal)
admin.site.register(Renda)