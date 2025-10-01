from rest_framework import serializers
from django.contrib.auth.models import User, Group 
from django.db import transaction

from .models import (
    Producto, Cliente, Pedido, Factura, Entrega, Pago, Incidente, Caja
)

class GroupSerializer(serializers.ModelSerializer):
    class Meta:
        model = Group
        fields = ('id', 'name')


class UserCreationSerializer(serializers.ModelSerializer):
    group_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = User
        fields = ('username', 'email', 'password', 'group_id')
        extra_kwargs = {'password': {'write_only': True}}
    
    @transaction.atomic
    def create(self, validated_data):
        group_id = validated_data.pop('group_id')
        password = validated_data.pop('password')
        
        user = User.objects.create(**validated_data)
        user.set_password(password)
        user.save()
        
        try:
            group = Group.objects.get(pk=group_id)
            user.groups.add(group)
        except Group.DoesNotExist:
            raise serializers.ValidationError({"group_id": "El rol (ID) especificado no existe."})
            
        return user


class ProductoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Producto
        fields = '__all__'


class ClienteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cliente
        fields = '__all__'


class PedidoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Pedido
        fields = '__all__'


class FacturaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Factura
        fields = '__all__'
        

class EntregaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Entrega
        fields = '__all__'


class PagoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Pago
        fields = '__all__'
        

class CajaSerializer(serializers.ModelSerializer):
    empleado = serializers.ReadOnlyField(source='empleado.username') 
    
    class Meta:
        model = Caja
        fields = '__all__'
        read_only_fields = ('empleado',) 


class IncidenteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Incidente
        fields = '__all__'



class UserInfoSerializer(serializers.ModelSerializer):
    roles = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'roles']

    def get_roles(self, obj):
        return list(obj.groups.values_list('name', flat=True))
