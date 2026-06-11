# Product Requirements Document (PRD)
# Tohatsu Motors - App de Venta y Post-Venta de Motores Fuera de Borda

## 1. Visión del Producto
Aplicación móvil completa para la venta y post-venta de motores fuera de borda marca Tohatsu, con dos interfaces principales: una para clientes finales y otra para administradores.

## 2. Objetivos del Producto
- Permitir a los clientes visualizar el catálogo completo de motores Tohatsu con detalles y precios
- Facilitar el contacto directo con el equipo de ventas, repuestos y servicio técnico vía WhatsApp
- Informar a los clientes sobre el calendario de servicios de mantenimiento gratuito por localidad
- Proporcionar herramientas de administración para gestionar motores, eventos y configuración

## 3. Usuarios Objetivo

### Clientes Finales
- Personas interesadas en comprar motores fuera de borda
- Propietarios de motores que necesitan repuestos o servicio técnico
- Usuarios que buscan información sobre mantenimiento gratuito

### Administradores
- Personal de ventas de la empresa
- Equipo de marketing
- Gestores de servicio técnico

## 4. Funcionalidades Principales

### 4.1 Módulo Cliente

#### 4.1.1 Catálogo de Motores
- **Descripción**: Vista principal que muestra todos los motores disponibles
- **Elementos visuales**: Imagen, modelo, potencia, precio
- **Interacción**: Tap en un motor para ver detalles completos
- **Actualización**: Pull-to-refresh para cargar datos más recientes

#### 4.1.2 Detalle de Motor
- **Información mostrada**:
  - Imagen del motor (base64)
  - Modelo y nombre
  - Potencia (HP)
  - Características técnicas
  - Precio en formato localizado
  - Información de financiamiento:
    - Valor de entrada
    - Número de cuotas (hasta 30 meses)
    - Valor de cuota mensual (calculado automáticamente)
    - Total financiado
- **Acciones**: Botón para ir directamente a contacto

#### 4.1.3 Calendario de Servicios
- **Descripción**: Lista de eventos programados de mantenimiento gratuito
- **Información mostrada**:
  - Fecha formateada en español
  - Localidad
  - Descripción del servicio
  - Badge "Mantenimiento Gratuito"
- **Actualización**: Pull-to-refresh

#### 4.1.4 Contacto (3 Opciones)
- **Opción 1: Quiero que me visite un asesor**
  - Color: Azul (#0066cc)
  - Icono: Persona
  - Acción: Abre modal de formulario
  
- **Opción 2: Pedido de repuestos originales**
  - Color: Verde (#00994d)
  - Icono: Herramientas
  - Acción: Abre modal de formulario
  
- **Opción 3: Servicio técnico**
  - Color: Naranja (#ff6600)
  - Icono: Reparación
  - Acción: Abre modal de formulario

#### 4.1.5 Formulario de Contacto
- **Campos requeridos**:
  - Nombre (texto)
  - Teléfono (numérico)
  - Localidad (texto)
- **Validación**: Todos los campos son obligatorios
- **Acción de envío**: 
  - Abre WhatsApp con mensaje pre-llenado
  - Formato del mensaje:
    ```
    Hola! Solicito [tipo de servicio]
    
    Nombre: [nombre]
    Teléfono: [teléfono]
    Localidad: [localidad]
    ```
  - Se envía al número de WhatsApp correspondiente según el tipo de servicio

### 4.2 Módulo Administrador

#### 4.2.1 Autenticación
- **Pantalla de login**:
  - Campo: Usuario
  - Campo: Contraseña (con opción de mostrar/ocultar)
  - Validación: Credenciales correctas vía API
  - Token JWT almacenado localmente
  - Redirección a dashboard tras login exitoso

#### 4.2.2 Dashboard
- **Menú principal** con 3 opciones:
  1. Gestionar Motores
  2. Gestionar Calendario
  3. Configuración
- **Acción**: Botón de logout (cierra sesión y borra token)

#### 4.2.3 Gestión de Motores
- **Vista lista**:
  - Muestra todos los motores con imagen miniatura, modelo y precio
  - Botones de acción: Editar, Eliminar
  - Estado vacío con mensaje y botón para agregar

- **Agregar Motor**:
  - Selección de imagen (desde galería, convertida a base64)
  - Campos:
    - Modelo* (texto)
    - Potencia* (texto)
    - Características (texto multilínea)
    - Precio* (numérico)
    - Entrada financiamiento (numérico)
    - Cuotas máximas (numérico, default: 30)
  - Validación de campos obligatorios (*)
  - Guardado con autenticación JWT

- **Eliminar Motor**:
  - Confirmación antes de eliminar
  - Eliminación vía API con token

#### 4.2.4 Gestión de Calendario
- **Vista lista**:
  - Muestra eventos con fecha, localidad y descripción
  - Botón para eliminar cada evento
  - Estado vacío con mensaje

- **Agregar Evento** (Modal):
  - Campos:
    - Fecha (formato YYYY-MM-DD)
    - Localidad (texto)
    - Descripción (texto multilínea)
  - Validación de campos obligatorios
  - Guardado con autenticación JWT

- **Eliminar Evento**:
  - Confirmación antes de eliminar
  - Eliminación vía API con token

#### 4.2.5 Configuración
- **Números de WhatsApp**:
  - Campo: WhatsApp Ventas/Asesores
  - Campo: WhatsApp Repuestos
  - Campo: WhatsApp Servicio Técnico
  - Formato: Internacional (ej: 593999999999)
  - Indicadores visuales por tipo de servicio (iconos de colores)
  - Guardado con autenticación JWT

## 5. Arquitectura Técnica

### 5.1 Frontend
- **Framework**: React Native con Expo Router
- **Navegación**: 
  - Tabs (Bottom Tabs) para cliente
  - Stack para administrador
- **Gestión de estado**: React Context API (AuthContext)
- **Almacenamiento local**: AsyncStorage
- **UI/UX**: Componentes nativos de React Native
- **Estilos**: StyleSheet.create()

### 5.2 Backend
- **Framework**: FastAPI (Python)
- **Base de datos**: MongoDB
- **Autenticación**: JWT con bcrypt
- **CORS**: Habilitado para todos los orígenes
- **Arquitectura**: API REST

### 5.3 Modelos de Datos

#### Motor
```python
{
  "modelo": str,
  "potencia": str,
  "caracteristicas": str,
  "precio": float,
  "imagen": str (base64),
  "financiamiento_entrada": float,
  "financiamiento_cuotas": int (default: 30)
}
```

#### CalendarioEvento
```python
{
  "fecha": str (YYYY-MM-DD),
  "localidad": str,
  "descripcion": str
}
```

#### Configuracion
```python
{
  "whatsapp_ventas": str,
  "whatsapp_repuestos": str,
  "whatsapp_servicio": str
}
```

#### Admin
```python
{
  "username": str,
  "password": str (hashed with bcrypt)
}
```

### 5.4 API Endpoints

#### Públicos (sin autenticación)
- `GET /api/` - Health check
- `GET /api/motors` - Lista de motores
- `GET /api/motors/{id}` - Detalle de motor
- `GET /api/calendar` - Lista de eventos
- `GET /api/config` - Configuración (números WhatsApp)

#### Autenticación
- `POST /api/auth/login` - Login (retorna JWT token)

#### Protegidos (requieren Bearer token)
- `POST /api/motors` - Crear motor
- `PUT /api/motors/{id}` - Actualizar motor
- `DELETE /api/motors/{id}` - Eliminar motor
- `POST /api/calendar` - Crear evento
- `PUT /api/calendar/{id}` - Actualizar evento
- `DELETE /api/calendar/{id}` - Eliminar evento
- `PUT /api/config` - Actualizar configuración

## 6. Flujo de Usuario

### 6.1 Flujo Cliente
1. Usuario abre la app → Pantalla de bienvenida
2. Selecciona "Ver Catálogo" → Entra a interfaz de cliente con tabs
3. **Tab Catálogo**: Ve lista de motores, tap en uno → Ve detalles completos
4. **Tab Calendario**: Ve fechas de mantenimiento gratuito por localidad
5. **Tab Contacto**: 
   - Selecciona tipo de servicio (Asesor/Repuestos/Servicio)
   - Llena formulario (Nombre, Teléfono, Localidad)
   - Tap "Enviar por WhatsApp"
   - WhatsApp se abre con mensaje pre-llenado
   - Envía mensaje al número correspondiente

### 6.2 Flujo Administrador
1. Usuario abre la app → Pantalla de bienvenida
2. Selecciona "Administrador" → Pantalla de login
3. Ingresa credenciales → Dashboard
4. **Gestionar Motores**:
   - Ve lista → Agregar nuevo
   - Selecciona imagen, llena datos
   - Guarda → Motor aparece en catálogo
   - Puede editar o eliminar motores existentes
5. **Gestionar Calendario**:
   - Ve lista → Agregar evento
   - Llena fecha, localidad, descripción
   - Guarda → Evento aparece en calendario de clientes
6. **Configuración**:
   - Ve números actuales de WhatsApp
   - Edita números
   - Guarda → Nuevos números se usan en formularios de contacto

## 7. Integración WhatsApp

### 7.1 URL Scheme
```
https://wa.me/{numero}?text={mensaje_url_encoded}
```

### 7.2 Números por Servicio
- **Ventas/Asesores**: Configurable en admin
- **Repuestos**: Configurable en admin
- **Servicio Técnico**: Configurable en admin

### 7.3 Formato de Mensaje
```
Hola! Solicito {tipo_servicio}

Nombre: {nombre}
Teléfono: {telefono}
Localidad: {localidad}
```

## 8. Manejo de Imágenes

### 8.1 Formato
- Todas las imágenes se almacenan en formato **base64**
- Prefix: `data:image/jpeg;base64,{string}`

### 8.2 Flujo de Carga
1. Admin selecciona imagen desde galería del dispositivo
2. Expo ImagePicker convierte imagen a base64
3. Se envía al backend como string
4. Se almacena en MongoDB
5. Cliente descarga y muestra directamente desde base64

### 8.3 Permisos
- App solicita permiso de galería al intentar seleccionar imagen
- Si se niega, muestra alerta

## 9. Seguridad

### 9.1 Autenticación
- Contraseñas hasheadas con bcrypt
- JWT con expiración de 24 horas
- Token almacenado en AsyncStorage

### 9.2 Autorización
- Endpoints protegidos verifican Bearer token
- Middleware de FastAPI valida cada request
- Respuestas 401/403 para accesos no autorizados

## 10. Diseño UI/UX

### 10.1 Colores Principales
- **Azul primario**: #0066cc (Ventas, acciones principales)
- **Verde**: #00994d (Repuestos)
- **Naranja**: #ff6600 (Servicio técnico)
- **Blanco**: #ffffff (Backgrounds)
- **Gris claro**: #f5f5f5 (Backgrounds secundarios)

### 10.2 Tipografía
- **Títulos**: Bold, 20-28px
- **Subtítulos**: Semibold, 16-18px
- **Texto normal**: Regular, 14-16px
- **Texto pequeño**: Regular, 12-14px

### 10.3 Componentes
- **Cards**: Bordes redondeados (12-16px), sombras sutiles
- **Botones**: Altura mínima 48px (touch target)
- **Inputs**: Padding 16px, bordes redondeados 12px
- **Iconos**: Expo Vector Icons (Ionicons)

### 10.4 Navegación
- **Bottom Tabs**: 3 tabs para cliente (Catálogo, Calendario, Contacto)
- **Stack**: Para navegación admin y detalles
- **Modales**: Para formularios y acciones rápidas

## 11. Estados de la Aplicación

### 11.1 Estados de Carga
- Spinner centrado durante fetch de datos
- Pull-to-refresh en listas
- Botones con loading state (ActivityIndicator)

### 11.2 Estados Vacíos
- Icono grande + mensaje descriptivo
- Botón de acción para agregar primer item
- Mensaje amigable y claro

### 11.3 Estados de Error
- Alerts para errores de API
- Mensajes específicos por tipo de error
- Opción de reintentar cuando aplique

## 12. Inicialización de Datos

### 12.1 Seed Automático (Backend)
- **Admin user**: username="admin", password="admin123"
- **Configuración default**:
  - whatsapp_ventas: "593999999999"
  - whatsapp_repuestos: "593988888888"
  - whatsapp_servicio: "593977777777"

### 12.2 Colecciones MongoDB
- `admins` - Usuarios administradores
- `motors` - Catálogo de motores
- `calendario` - Eventos de mantenimiento
- `configuracion` - Números WhatsApp y ajustes

## 13. Testing Completado

### 13.1 Backend Testing ✅
- **16/16 tests passed**
- Authentication endpoints
- Motors CRUD operations
- Calendar CRUD operations
- Configuration management
- Authorization validation

### 13.2 Resultados
- Todos los endpoints funcionando correctamente
- Autenticación JWT operativa
- Base de datos con seed exitoso
- API lista para producción

## 14. URLs de Acceso

### 14.1 Producción
- **Frontend**: https://outboard-dealer-app.preview.emergentagent.com
- **Backend API**: https://outboard-dealer-app.preview.emergentagent.com/api

### 14.2 Desarrollo Local
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8001/api

## 15. Credenciales de Prueba
- **Usuario Admin**: admin
- **Contraseña**: admin123

## 16. Próximas Mejoras Sugeridas
1. Búsqueda y filtros en catálogo
2. Comparador de motores
3. Favoritos/Wishlist
4. Notificaciones push para nuevos eventos
5. Galería múltiple de imágenes por motor
6. Calculadora de financiamiento interactiva
7. Historial de contactos (para admin)
8. Analytics de productos más vistos
9. Sistema de chat en tiempo real
10. Integración con sistema de inventario

## 17. Notas Técnicas Importantes
- Imágenes en base64 pueden aumentar tamaño de respuestas API
- JWT expira en 24 horas, requiere re-login
- WhatsApp requiere formato internacional de números
- App funciona offline parcialmente (datos cacheados)
- Compatible con iOS y Android
