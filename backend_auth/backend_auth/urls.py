# backend_Auth/urls.py (Archivo PRINCIPAL del proyecto)

from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    # Ruta del administrador de Django
    path('admin/', admin.site.urls),

    path('api/', include('core.urls')), 
]