# core/views.py

import json
from datetime import datetime
from django.contrib.auth import authenticate
from django.contrib.auth.models import User, Group
from django.db.models import Sum, Q, Count 
from rest_framework import status, viewsets
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from .models import Categoria
from .serializers import CategoriaSerializer

from .permissions import IsAdminGroup 
from .models import (
    Producto, Cliente, Pedido, Factura, Entrega, Pago, Incidente, Caja, Alquiler
)
from .serializers import (
    GroupSerializer, UserCreationSerializer, UserInfoSerializer, 
    ProductoSerializer, ClienteSerializer, PedidoSerializer, 
    FacturaSerializer, EntregaSerializer, PagoSerializer, IncidenteSerializer, 
    CajaSerializer
)


# ==========================
# 🔐 LOGIN Y USUARIOS
# ==========================

class LoginView(APIView):
    """
    Permite a los usuarios iniciar sesión y obtener tokens JWT.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')

        user = authenticate(username=username, password=password)

        if user is not None:
            refresh = RefreshToken.for_user(user)
            roles = list(user.groups.values_list('name', flat=True))
            return Response({
                'access': str(refresh.access_token),
                'refresh': str(refresh),
                'username': user.username,
                'roles': roles
            }, status=status.HTTP_200_OK)
        return Response({'detail': 'Credenciales inválidas'}, status=status.HTTP_401_UNAUTHORIZED)


class UserInfoView(APIView):
    """
    Devuelve la información del usuario logueado, incluyendo sus roles.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        roles = list(user.groups.values_list('name', flat=True))
        
        return Response({
            'id': user.id,
            'username': user.username,
            'roles': roles 
        })


class GroupViewSet(viewsets.ReadOnlyModelViewSet):
    """Permite al admin obtener la lista de roles disponibles."""
    permission_classes = [IsAdminGroup] 
    queryset = Group.objects.all()
    serializer_class = GroupSerializer


class AdminUserCreateView(APIView):
    """Crea un nuevo usuario con rol Admin."""
    permission_classes = [IsAdminGroup] 

    def post(self, request):
        serializer = UserCreationSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            try:
                admin_group, created = Group.objects.get_or_create(name='Admin')
                user.groups.add(admin_group)
            except Exception as e:
                return Response({'detail': f"Error al asignar rol Admin: {e}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR) 

            return Response({'message': 'Usuario Admin creado y asignado al rol "Admin"'}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class EmployeeUserCreateView(APIView):
    """Crea un nuevo usuario y lo asigna al rol Empleado."""
    permission_classes = [IsAdminGroup] 

    def post(self, request):
        serializer = UserCreationSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            try:
                empleado_group, created = Group.objects.get_or_create(name='Empleado')
                user.groups.add(empleado_group)
            except Exception as e:
                return Response({'detail': f"Error al asignar rol Empleado: {e}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR) 

            return Response({'message': 'Empleado creado y asignado al rol "Empleado"'}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class EmployeeViewSet(viewsets.ModelViewSet):
    """Permite listar, ver, actualizar y eliminar usuarios Empleados."""
    queryset = User.objects.filter(groups__name='Empleado').order_by('username')
    serializer_class = UserInfoSerializer
    permission_classes = [IsAdminGroup] 

    def create(self, request, *args, **kwargs):
        return Response({"detail": "Use /user/create/employee/ endpoint for creation."}, status=status.HTTP_405_METHOD_NOT_ALLOWED)


# ==========================
# 📦 CRUD DE MODELOS
# ==========================

class ProductoViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated] 
    queryset = Producto.objects.all()
    serializer_class = ProductoSerializer 


class ClienteViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    queryset = Cliente.objects.all()
    serializer_class = ClienteSerializer


class PedidoViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    queryset = Pedido.objects.all()
    serializer_class = PedidoSerializer


class FacturaViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    queryset = Factura.objects.all()
    serializer_class = FacturaSerializer


class EntregaViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    queryset = Entrega.objects.all()
    serializer_class = EntregaSerializer


class PagoViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    queryset = Pago.objects.all()
    serializer_class = PagoSerializer


class CajaViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    queryset = Caja.objects.all().order_by('-fecha_apertura')
    serializer_class = CajaSerializer
    
    def perform_create(self, serializer):
        serializer.save(empleado=self.request.user)


class IncidenteViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    queryset = Incidente.objects.all()
    serializer_class = IncidenteSerializer


class CategoriaViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    queryset = Categoria.objects.all().order_by('nombre_categoria')
    serializer_class = CategoriaSerializer



# ==========================
# 📊 DASHBOARD ADMIN / EMPLEADO
# ==========================

class DashboardSummaryView(APIView):
    """
    Devuelve los datos del panel de control (dashboard),
    adaptado a los nombres reales de los campos del modelo según tu DER.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        es_administrador = user.groups.filter(name='Admin').exists()

        # --- DATOS COMUNES (visibles a todos) ---
        pedidos_pendientes = Pedido.objects.filter(estado_ped='Pendiente').count()
        incidentes_abiertos = Incidente.objects.filter(estado_incidente='Abierto').count()


        data = {
            'pedidos_pendientes': pedidos_pendientes,
            'incidentes_abiertos': incidentes_abiertos,
            'es_administrador': es_administrador,
        }

        # --- DATOS ADICIONALES SOLO PARA ADMIN ---
        if es_administrador:
            ahora = datetime.now()

            ingresos_mes = (
                Factura.objects.filter(
                    estado_fact='Pagada',
                    fecha_fact__month=ahora.month,
                    fecha_fact__year=ahora.year
                ).aggregate(Sum('total_fact'))['total_fact__sum'] or 0.00
            )

            alquileres_activos = Alquiler.objects.filter(estado_alq='Activo').count()

            data.update({
                'ingresos_mes': round(ingresos_mes, 2),
                'alquileres_activos': alquileres_activos,
            })

        return Response(data, status=status.HTTP_200_OK)
