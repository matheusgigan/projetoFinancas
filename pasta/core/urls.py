from rest_framework_nested import routers
from .views import GrupoViewSet, DespesaViewSet

router = routers.DefaultRouter()
router.register(r'grupos', GrupoViewSet, basename='grupo')
grupos_router = routers.NestedDefaultRouter(router, r'grupos', lookup='grupo')
grupos_router.register(r'despesas', DespesaViewSet, basename='grupo-despesas')
urlpatterns = router.urls + grupos_router.urls