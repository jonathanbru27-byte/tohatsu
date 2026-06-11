# Tohatsu Motors - App de Venta y Post-Venta

## 📱 Descripción
Aplicación móvil para la venta y post-venta de motores fuera de borda Tohatsu. Incluye dos capas principales:
- **Cliente**: Visualización de catálogo, calendario de servicios y opciones de contacto
- **Administrador**: Gestión completa de motores, eventos y configuración

## 🚀 Características

### Para Clientes:
- ✅ Catálogo de motores con imágenes, precios y especificaciones
- ✅ Detalle completo de cada motor con información de financiamiento
- ✅ Calendario de servicios de mantenimiento gratuito por localidad
- ✅ 3 botones de contacto vía WhatsApp:
  - **Quiero que me visite un asesor**
  - **Pedido de repuestos originales**
  - **Servicio técnico**
- ✅ Formularios de contacto que abren WhatsApp con mensaje pre-llenado

### Para Administradores:
- ✅ Login seguro con autenticación JWT
- ✅ Gestión de motores (agregar, editar, eliminar)
- ✅ Subida de imágenes en formato base64
- ✅ Configuración de financiamiento por motor
- ✅ Gestión de calendario de eventos
- ✅ Configuración de números de WhatsApp para cada servicio

## 🔐 Credenciales de Prueba
- **Usuario:** admin
- **Contraseña:** admin123

## 🎨 Tecnologías Utilizadas
- **Frontend:** React Native + Expo Router
- **Backend:** FastAPI + Python
- **Base de Datos:** MongoDB
- **Navegación:** React Navigation (Tabs + Stack)
- **Imágenes:** Base64 encoding
- **Integración:** WhatsApp URL Scheme

## 📋 Estructura de la Aplicación

### Rutas Cliente:
- `/client` - Catálogo de motores (Tab principal)
- `/client/calendar` - Calendario de servicios
- `/client/contact` - Opciones de contacto
- `/client/motor/[id]` - Detalle del motor

### Rutas Admin:
- `/admin/login` - Acceso administrador
- `/admin/dashboard` - Panel de control
- `/admin/motors` - Gestión de motores
- `/admin/motors/add` - Agregar motor
- `/admin/calendar` - Gestión de calendario
- `/admin/config` - Configuración WhatsApp

## 🔌 API Endpoints

### Autenticación:
- `POST /api/auth/login` - Login de administrador

### Motores:
- `GET /api/motors` - Listar todos los motores
- `GET /api/motors/{id}` - Obtener un motor específico
- `POST /api/motors` - Crear motor (requiere auth)
- `PUT /api/motors/{id}` - Actualizar motor (requiere auth)
- `DELETE /api/motors/{id}` - Eliminar motor (requiere auth)

### Calendario:
- `GET /api/calendar` - Listar eventos
- `POST /api/calendar` - Crear evento (requiere auth)
- `PUT /api/calendar/{id}` - Actualizar evento (requiere auth)
- `DELETE /api/calendar/{id}` - Eliminar evento (requiere auth)

### Configuración:
- `GET /api/config` - Obtener configuración
- `PUT /api/config` - Actualizar configuración (requiere auth)

## 📱 Integración WhatsApp
La aplicación utiliza el URL scheme de WhatsApp para enviar mensajes pre-llenados:
```
https://wa.me/{numero}?text={mensaje_codificado}
```

Los mensajes incluyen:
- Nombre del cliente
- Teléfono
- Localidad
- Tipo de servicio solicitado

## 💾 Modelo de Datos

### Motor:
- modelo (string)
- potencia (string)
- caracteristicas (string)
- precio (number)
- imagen (base64 string)
- financiamiento_entrada (number)
- financiamiento_cuotas (number, default: 30)

### CalendarioEvento:
- fecha (string, YYYY-MM-DD)
- localidad (string)
- descripcion (string)

### Configuracion:
- whatsapp_ventas (string)
- whatsapp_repuestos (string)
- whatsapp_servicio (string)

## 🎯 Próximos Pasos Sugeridos
- Agregar más filtros en el catálogo
- Implementar búsqueda de motores
- Agregar notificaciones push
- Mejorar la validación de formularios
- Agregar opción de compartir motores
