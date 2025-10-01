from django.db import models
from django.contrib.auth.models import User 



class Producto(models.Model):
    nombre = models.CharField(max_length=100)
    descripcion = models.TextField(blank=True)
    precio_alquiler = models.DecimalField(max_digits=10, decimal_places=2)
    stock = models.IntegerField(default=0)
    
    def __str__(self):
        return self.nombre

class Cliente(models.Model):
    nombre = models.CharField(max_length=100)
    apellido = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    telefono = models.CharField(max_length=20, blank=True)
    
    def __str__(self):
        return f"{self.nombre} {self.apellido}"

class Pedido(models.Model):
    cliente = models.ForeignKey(Cliente, on_delete=models.CASCADE)
    fecha_pedido = models.DateTimeField(auto_now_add=True)
    fecha_entrega = models.DateField()
    fecha_devolucion = models.DateField(null=True, blank=True)
    estado = models.CharField(max_length=50, default='Pendiente')
    
    def __str__(self):
        return f"Pedido #{self.id} de {self.cliente}"

class Factura(models.Model):
    pedido = models.OneToOneField(Pedido, on_delete=models.CASCADE)
    fecha_emision = models.DateTimeField(auto_now_add=True)
    total = models.DecimalField(max_digits=10, decimal_places=2)
    estado = models.CharField(max_length=50, default='Pendiente')
    
    def __str__(self):
        return f"Factura #{self.id} (Total: {self.total})"

class Entrega(models.Model):
    pedido = models.OneToOneField(Pedido, on_delete=models.CASCADE)
    fecha_real = models.DateTimeField(auto_now_add=True)
    empleado_entrega = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='entregas_hechas')
    
    def __str__(self):
        return f"Entrega de Pedido #{self.pedido_id}"

class Pago(models.Model):
    factura = models.ForeignKey(Factura, on_delete=models.CASCADE)
    monto = models.DecimalField(max_digits=10, decimal_places=2)
    fecha_pago = models.DateTimeField(auto_now_add=True)
    metodo = models.CharField(max_length=50)
    
    def __str__(self):
        return f"Pago de {self.monto} para Factura #{self.factura_id}"

# === NUEVO MODELO PARA GESTIÓN DE CAJA ===
class Caja(models.Model):
    TIPO_CHOICES = [
        ('IN', 'Ingreso'),
        ('EG', 'Egreso'),
    ]
    fecha = models.DateTimeField(auto_now_add=True)
    tipo_movimiento = models.CharField(max_length=2, choices=TIPO_CHOICES)
    monto = models.DecimalField(max_digits=10, decimal_places=2)
    descripcion = models.CharField(max_length=255)
    empleado = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    
    def __str__(self):
        return f"{self.tipo_movimiento} - {self.monto} ({self.fecha.date()})"
        
class Incidente(models.Model):
    pedido = models.ForeignKey(Pedido, on_delete=models.SET_NULL, null=True, blank=True)
    fecha_reporte = models.DateTimeField(auto_now_add=True)
    descripcion = models.TextField()
    estado = models.CharField(max_length=50, default='Abierto')
    
    def __str__(self):
        return f"Incidente #{self.id} - {self.estado}"