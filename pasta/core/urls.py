from rest_framework_nested import routers
from .views import GrupoViewSet, DespesaViewSet, GastoFixoViewSet, MetaPessoalViewSet, RendaViewSet, DepositoMetaViewSet

router = routers.DefaultRouter()
router.register(r'grupos', GrupoViewSet, basename='grupo')
router.register(r'gastos-fixos', GastoFixoViewSet, basename='gastofixo')
router.register(r'metas-pessoais', MetaPessoalViewSet, basename='metapessoal')
router.register(r'rendas', RendaViewSet, basename='renda')
router.register(r'depositos-meta', DepositoMetaViewSet, basename='depositometa')
# O router aninhado para despesas continua o mesmo
grupos_router = routers.NestedDefaultRouter(router, r'grupos', lookup='grupo')
grupos_router.register(r'despesas', DespesaViewSet, basename='grupo-despesas')

urlpatterns = router.urls + grupos_router.urls