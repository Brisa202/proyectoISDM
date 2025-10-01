from django.contrib.auth.models import User, Group
from rest_framework import serializers

class GroupSerializer(serializers.ModelSerializer):
    """Serializador para exponer la información de los Grupos (Roles)."""
    class Meta:
        model = Group
        fields = ('id', 'name')

class UserCreationSerializer(serializers.ModelSerializer):
    """
    Serializador para la creación de usuarios por parte de un administrador.
    Requiere el group_id (el ID del rol) para asignar al usuario.
    """

    group_id = serializers.IntegerField(write_only=True, label="ID del Rol a Asignar")

    class Meta:
        model = User
        # username, email, password son obligatorios. group_id es para el rol.
        fields = ('username', 'email', 'password', 'group_id')
        extra_kwargs = {'password': {'write_only': True}} # Oculta la contraseña en la respuesta

    def create(self, validated_data):
        # Extraer el group_id y la password antes de crear el objeto User
        group_id = validated_data.pop('group_id')
        password = validated_data.pop('password')
        
        # 1. Crear la instancia de Usuario
        user = User.objects.create(
            username=validated_data['username'], 
            email=validated_data.get('email', '')
        )

        user.set_password(password)
        user.save()
        

        try:
            group = Group.objects.get(pk=group_id)
            user.groups.add(group)
        except Group.DoesNotExist:
            raise serializers.ValidationError({"group_id": "El rol especificado no existe o es inválido."})
            
        return user