# backend_Auth/views.py

from django.contrib.auth.models import Group
from rest_framework import viewsets, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser # Permiso clave: solo Admin

# Importa los Serializers que acabas de crear
from .serializers import GroupSerializer, UserCreationSerializer 

# 1. Vista para obtener la lista de Roles (Grupos)
class GroupViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Permite al administrador obtener la lista de roles (Grupos) de Django.
    Endpoint: GET /api/groups/ (si configuras el router)
    """
    # Solo los administradores pueden ver la lista de roles para asignarlos
    permission_classes = [IsAdminUser] 
    queryset = Group.objects.all()
    serializer_class = GroupSerializer

# 2. Vista para crear usuarios y asignarles un rol
class AdminUserCreateView(APIView):
    """
    Permite al administrador crear un nuevo usuario y asignarle un rol específico.
    Endpoint: POST /api/users/create/
    """
    # Solo el usuario con permisos de Admin puede acceder
    permission_classes = [IsAdminUser] 

    def post(self, request, format=None):
        serializer = UserCreationSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({
                "message": "Usuario creado y rol asignado con éxito."
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)