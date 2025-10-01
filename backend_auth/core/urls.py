# core/urls.py

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

from .views import (
    UserInfoView,
    AdminUserCreateView, 
    EmployeeUserCreateView,    
    EmployeeViewSet,           
    DashboardSummaryView,      
    GroupViewSet, 
    ProductoViewSet, 
    ClienteViewSet, 
    PedidoViewSet, 
    FacturaViewSet, 
    EntregaViewSet, 
    PagoViewSet, 
    IncidenteViewSet, 
    CajaViewSet
)

# 1. Configuración del Router
router = DefaultRouter()

# Rutas de Seguridad/Roles
router.register(r'groups', GroupViewSet, basename='group')
router.register(r'employees', EmployeeViewSet, basename='employee') # 👈 AGREGADA para gestión de empleados

# Rutas de Negocio (CRUD)
router.register(r'productos', ProductoViewSet)
router.register(r'clientes', ClienteViewSet)
router.register(r'pedidos', PedidoViewSet)
router.register(r'facturas', FacturaViewSet)
router.register(r'entregas', EntregaViewSet)
router.register(r'pagos', PagoViewSet)
router.register(r'caja', CajaViewSet, basename='caja')
router.register(r'incidentes', IncidenteViewSet)


urlpatterns = [
    # Rutas JWT Estándar
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # Rutas de Creación de Usuarios
    path('users/create/admin/', AdminUserCreateView.as_view(), name='admin-user-create'),
    path('users/create/employee/', EmployeeUserCreateView.as_view(), name='employee-user-create'), # 👈 AGREGADA
    
    # Rutas de Información y Dashboard
    path('user/info/', UserInfoView.as_view(), name='user_info'),
    path('dashboard/summary/', DashboardSummaryView.as_view(), name='dashboard-summary'), # 👈 AGREGADA (Tu nuevo dashboard)
    
    # Rutas del Router (CRUDs de Modelos)
    path('', include(router.urls)),
]