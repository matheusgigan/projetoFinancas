# core/urls.py

from rest_framework_nested import routers
# Importe a nova DespesaViewSet que criamos
from .views import GrupoViewSet, DespesaViewSet

# 1. Cria o router principal, o mesmo que tínhamos antes para os grupos.
router = routers.DefaultRouter()
router.register(r'grupos', GrupoViewSet, basename='grupo')

# 2. Cria um novo router ANINHADO a partir do router principal.
#    Ele usará a URL 'grupos' como base.
#    O 'lookup' diz qual parâmetro na URL corresponde a um grupo (ex: 'grupo_pk').
grupos_router = routers.NestedDefaultRouter(router, r'grupos', lookup='grupo')

# 3. Registra a DespesaViewSet neste novo router aninhado.
#    Isso criará as URLs como /grupos/{grupo_pk}/despesas/
grupos_router.register(r'despesas', DespesaViewSet, basename='grupo-despesas')

# 4. As urlpatterns do nosso app 'core' agora incluem as rotas de ambos os routers.
urlpatterns = router.urls + grupos_router.urls