# core/urls.py
from django.urls import path
from rest_framework_nested import routers
from .views import (
    GrupoViewSet, 
    DespesaViewSet, 
    GastoFixoViewSet, 
    MetaPessoalViewSet, 
    RendaViewSet, 
    MetaGrupoViewSet, 
    ContribuicaoViewSet,
    DepositoMetaViewSet, # Garanta que esta importação está aqui
    MinhasContribuicoesViewSet,
    PagamentoGastoFixoViewSet, 
    MinhasContribuicoesViewSet, 
    ChartDataView,
    ExtratoView
)

router = routers.DefaultRouter()
router.register(r'grupos', GrupoViewSet, basename='grupo')
router.register(r'gastos-fixos', GastoFixoViewSet, basename='gastofixo')
router.register(r'metas-pessoais', MetaPessoalViewSet, basename='metapessoal')
router.register(r'rendas', RendaViewSet, basename='renda')
# A LINHA QUE ESTAVA FALTANDO:
router.register(r'depositos-meta', DepositoMetaViewSet, basename='depositometa')
router.register(r'minhas-contribuicoes', MinhasContribuicoesViewSet, basename='minhacontribuicao')
router.register(r'pagamentos-gastos-fixos', PagamentoGastoFixoViewSet, basename='pagamentogastofixo')

# Roteadores aninhados
grupos_router = routers.NestedDefaultRouter(router, r'grupos', lookup='grupo')
grupos_router.register(r'despesas', DespesaViewSet, basename='grupo-despesas')
grupos_router.register(r'metas', MetaGrupoViewSet, basename='grupo-metas')

metas_grupo_router = routers.NestedDefaultRouter(grupos_router, r'metas', lookup='meta')
metas_grupo_router.register(r'contribuicoes', ContribuicaoViewSet, basename='meta-contribuicoes')

urlpatterns = router.urls + grupos_router.urls + metas_grupo_router.urls
urlpatterns.append(
    path('chart-data/', ChartDataView.as_view(), name='chart-data')
)
urlpatterns.append(
    path('extrato/', ExtratoView.as_view(), name='extrato-financeiro')
)