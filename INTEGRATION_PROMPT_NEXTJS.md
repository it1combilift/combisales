# 🚗 PROMPT: Módulo de Inspección de Vehículos para CombiSales (Este proyecto)

## CONTEXTO PARA LA IA

Necesito que desarrolles un **módulo completo de inspección de vehículos** para mi aplicación Next.js existente. Este documento contiene toda la lógica de negocio, funcionalidades y reglas extraídas de un sistema Laravel que ya está funcionando en producción. Tu trabajo es implementar este módulo adaptándolo a mi stack actual.

**Stack de mi aplicación Next.js:**

- **ORM:** Prisma
- **Validaciones:** Zod
- **Formularios:** React Hook Form
- **HTTP Client:** Axios
- **UI Components:** Shadcn/ui
- **Estilos:** Tailwind CSS
- **Autenticación:** Ya configurada con Zoho OAuth

**Tienes libertad creativa para:**

- Proponer nuevos roles más específicos y granulares
- Mejorar la arquitectura y estructura del sistema
- Implementar mejores prácticas de UX/UI
- Añadir funcionalidades que consideres necesarias

---

## 📋 DESCRIPCIÓN DEL NEGOCIO

### ¿Qué es este sistema?

Es un sistema de gestión digital para **inspecciones de vehículos** de flota empresarial. Permite a los inspectores/mecánicos realizar chequeos preventivos documentados de vehículos, capturando evidencia fotográfica y generando reportes PDF que se sincronizan con Zoho CRM.

### Problema que resuelve

Antes de este sistema, las inspecciones se hacían en papel, se perdían documentos, no había trazabilidad de quién inspeccionó qué, y era imposible hacer seguimiento. Este sistema digitaliza todo el proceso con evidencia fotográfica y firma digital.

### Usuarios del sistema

1. **Inspectores/Mecánicos**: Realizan las inspecciones diarias de vehículos
2. **Supervisores/Administradores**: Revisan y aprueban las inspecciones
3. **Gerencia**: Visualiza reportes y estadísticas

---

## 🎯 FUNCIONALIDADES PRINCIPALES

### 1. Crear Inspección de Vehículo

- El inspector selecciona o ingresa datos del vehículo (modelo, matrícula, kilometraje)
- Completa un checklist de 14 puntos de verificación
- Captura 6 fotografías obligatorias del vehículo
- Firma digitalmente la inspección
- El sistema genera automáticamente un PDF
- Se sincroniza con Zoho CRM
- Se envía notificación por email

### 2. Aprobar Inspecciones

- Solo los administradores pueden aprobar
- Al aprobar, se actualiza el estado en Zoho CRM
- Se registra quién aprobó y cuándo

### 3. Dashboard

- **Administradores**: Ven todas las inspecciones, estadísticas globales, inspecciones pendientes
- **Inspectores**: Solo ven sus propias inspecciones y su historial

### 4. Gestión de Usuarios

- CRUD de usuarios (solo admin)
- Asignación de roles

---

## 🗄️ MODELO DE DATOS

### Entidad: Usuario (User)

| Campo        | Tipo            | Descripción                                   |
| ------------ | --------------- | --------------------------------------------- |
| id           | Int (PK)        | Identificador único                           |
| name         | String          | Nombre completo del usuario                   |
| email        | String (Unique) | Email corporativo                             |
| zoho_user_id | String          | ID del usuario en Zoho (se obtiene del OAuth) |
| avatar       | String?         | URL de foto de perfil de Zoho                 |
| created_at   | DateTime        | Fecha de creación                             |
| updated_at   | DateTime        | Última actualización                          |

**Notas:**

- NO hay campo password - la autenticación es exclusivamente por Zoho OAuth
- El `zoho_user_id` es crítico para sincronizar inspecciones con el CRM
- Solo se permiten emails del dominio corporativo (@combilift.es actualmente)

---

### Entidad: Inspección (Inspection)

| Campo                       | Tipo     | Descripción                                    |
| --------------------------- | -------- | ---------------------------------------------- |
| id                          | Int (PK) | Identificador único                            |
| **Datos del vehículo**      |          |                                                |
| modelo                      | String   | Modelo del vehículo (ej: "Toyota Hilux 2024")  |
| matricula                   | String   | Placa/matrícula del vehículo                   |
| kilometraje                 | String   | Kilometraje actual al momento de inspección    |
| **Checklist - Niveles (4)** | Boolean  |                                                |
| nivel_deposito_refrigerante | Boolean  | Depósito de refrigerante en frío               |
| nivel_liquido_frenos        | Boolean  | Nivel de líquido de frenos                     |
| nivel_aceite_motor          | Boolean  | Nivel de aceite del motor                      |
| nivel_agua_limpia           | Boolean  | Nivel de agua/limpiaparabrisas                 |
| **Checklist - Pedales (3)** | Boolean  |                                                |
| pedales_acelerador          | Boolean  | Estado del pedal acelerador                    |
| pedales_embrague            | Boolean  | Estado del pedal embrague                      |
| pedales_freno               | Boolean  | Estado del pedal de freno                      |
| **Checklist - Luces (7)**   | Boolean  |                                                |
| luces                       | Boolean  | Luces principales (posición, cruce, carretera) |
| luces_intermitentes         | Boolean  | Intermitentes y warning                        |
| luces_matricula             | Boolean  | Luces de matrícula                             |
| luces_freno                 | Boolean  | Luces de freno                                 |
| luces_antinieblas           | Boolean  | Luces antiniebla                               |
| luces_marcha_atras          | Boolean  | Luces de marcha atrás                          |
| luces_interiores            | Boolean  | Luces interiores del habitáculo                |
| **Observaciones**           |          |                                                |
| observaciones               | Text?    | Campo de texto libre para anotaciones          |
| **Archivos**                |          |                                                |
| url_pdf                     | String   | Ruta del PDF generado automáticamente          |
| photo_front                 | String   | Foto frontal del vehículo                      |
| photo_back                  | String   | Foto trasera del vehículo                      |
| photo_driver_side           | String   | Foto del lado del conductor                    |
| photo_passenger_side        | String   | Foto del lado del pasajero                     |
| photo_interior              | String   | Foto del interior                              |
| photo_safety_devices        | String   | Foto de dispositivos de seguridad              |
| **Estado y metadatos**      |          |                                                |
| status                      | Int      | 0 = Pendiente de aprobación, 1 = Aprobada      |
| user_id                     | Int (FK) | Usuario que realizó la inspección              |
| zohoRecordId                | String?  | ID del registro en Zoho CRM                    |
| created_at                  | DateTime | Fecha de la inspección                         |
| updated_at                  | DateTime | Última actualización                           |

**Reglas de negocio:**

- Los 14 campos de checklist son obligatorios
- Se muestran al usuario como "Bien" o "Mal", se guardan como boolean
- Las 6 fotografías son OBLIGATORIAS
- El PDF se genera automáticamente después de guardar
- `zohoRecordId` se obtiene tras sincronizar con Zoho

---

### Entidad: Aprobación (Approbation)

| Campo         | Tipo     | Descripción                    |
| ------------- | -------- | ------------------------------ |
| id            | Int (PK) | Identificador único            |
| user_id       | Int (FK) | Admin que aprobó la inspección |
| inspection_id | Int (FK) | Inspección que fue aprobada    |
| created_at    | DateTime | Momento de la aprobación       |

**Propósito:** Auditoría - saber quién aprobó cada inspección y cuándo.

---

### Relaciones

```
User (1) ──────< (N) Inspection
     "Un usuario puede tener muchas inspecciones"
     "Una inspección pertenece a un usuario"

User (1) ──────< (N) Approbation
     "Un admin puede aprobar muchas inspecciones"

Inspection (1) ──────< (1) Approbation
     "Una inspección tiene máximo una aprobación"
```

---

## 👥 SISTEMA DE ROLES Y PERMISOS

### Roles actuales (Sistema Laravel)

| Rol     | Descripción                    |
| ------- | ------------------------------ |
| admin   | Administrador con acceso total |
| usuario | Inspector/mecánico básico      |

### Permisos actuales

| Permiso                      | admin | usuario |
| ---------------------------- | ----- | ------- |
| crear usuarios               | ✅    | ❌      |
| editar usuarios              | ✅    | ❌      |
| eliminar usuarios            | ✅    | ❌      |
| ver usuarios                 | ✅    | ✅      |
| crear roles                  | ✅    | ❌      |
| eliminar roles               | ✅    | ❌      |
| crear inspecciones           | ✅    | ✅      |
| ver todas las inspecciones   | ✅    | ❌      |
| ver sus propias inspecciones | ✅    | ✅      |
| aprobar inspecciones         | ✅    | ❌      |

### Reglas de acceso

1. Al autenticarse por primera vez vía Zoho OAuth, el usuario recibe automáticamente el rol "usuario"
2. Solo emails del dominio corporativo pueden acceder
3. Los inspectores solo ven sus propias inspecciones
4. Los admin ven todas las inspecciones
5. Solo admin pueden aprobar inspecciones
6. Solo admin pueden gestionar usuarios

---

## 🔄 FLUJOS DE TRABAJO

### FLUJO 1: Autenticación

1. Usuario hace clic en "Iniciar sesión con Zoho"
2. Se redirige a Zoho OAuth
3. Usuario autoriza la aplicación
4. Zoho devuelve callback con datos del usuario
5. **Validación de dominio**: Si el email NO termina en el dominio corporativo, se rechaza el acceso
6. Si el usuario no existe en BD, se crea con rol "usuario"
7. Si ya existe, se actualizan sus datos (nombre, avatar)
8. Usuario queda autenticado

**Datos que se obtienen de Zoho:**

- Nombre completo
- Email
- ID de usuario de Zoho (crítico para CRM)
- URL de avatar

---

### FLUJO 2: Crear Inspección (Principal)

**Paso 1: Formulario**

- Inspector accede al formulario de nueva inspección
- Ingresa: modelo del vehículo, matrícula, kilometraje actual

**Paso 2: Checklist**

- Evalúa 14 puntos del vehículo
- Cada punto se marca como "Bien" (sin problemas) o "Mal" (requiere atención)
- Los puntos están agrupados en: Niveles (4), Pedales (3), Luces (7)

**Paso 3: Fotografías**

- Debe capturar 6 fotos obligatorias:
    1. Frente del vehículo
    2. Parte trasera
    3. Lado del conductor
    4. Lado del pasajero
    5. Interior/habitáculo
    6. Dispositivos de seguridad (extintores, triángulos, etc.)
- Cada foto se sube inmediatamente al servidor (no espera al final)
- Se muestra preview de cada foto capturada

**Paso 4: Observaciones**

- Campo de texto libre opcional
- Para anotar cualquier detalle adicional o problema encontrado

**Paso 5: Firma Digital**

- El inspector firma en un canvas táctil
- La firma se guarda como imagen PNG
- Es OBLIGATORIA para completar la inspección

**Paso 6: Envío**
Al enviar el formulario, el backend ejecuta secuencialmente:

1. **Guardar inspección en BD** con status = 0 (pendiente)
2. **Guardar firma** como archivo PNG en storage
3. **Generar PDF** con todos los datos, fotos y firma
4. **Actualizar inspección** con la URL del PDF
5. **Sincronizar con Zoho CRM** - crear registro en módulo "Inspecciones_de_vehiculos"
6. **Guardar zohoRecordId** retornado por Zoho
7. **Enviar email de notificación**:
    - TO: Inspector que creó la inspección
    - BCC: Todos los administradores

**Paso 7: Confirmación**

- Usuario ve mensaje de éxito
- Se redirige al dashboard

---

### FLUJO 3: Aprobar Inspección

**Solo disponible para administradores**

1. Admin ve lista de inspecciones pendientes (status = 0)
2. Hace clic en una inspección para ver detalle
3. Revisa toda la información, fotos, checklist
4. Si todo está correcto, hace clic en "Aprobar"
5. El sistema:
    - Actualiza status = 1 en BD local
    - Crea registro en tabla `approbations` (quién aprobó, cuándo)
    - Actualiza el estado en Zoho CRM a "Aprobada"
6. La inspección ya no aparece como pendiente

---

### FLUJO 4: Dashboard

**Para Administradores:**

- Total de inspecciones en el sistema
- Cantidad de inspecciones pendientes de aprobar
- Lista de usuarios con cantidad de inspecciones cada uno
- Tabla con TODAS las inspecciones (de todos los usuarios)
- Filtros y búsqueda

**Para Inspectores:**

- Total de sus inspecciones
- Fecha de su última inspección
- Tabla solo con SUS propias inspecciones

---

## 🔗 INTEGRACIÓN CON ZOHO CRM

### Módulo en Zoho: "Inspecciones_de_vehiculos"

**Campos mapeados (Laravel → Zoho):**

| Campo Local                 | Campo Zoho                    |
| --------------------------- | ----------------------------- |
| user.zoho_user_id           | Owner                         |
| user.name                   | Name                          |
| created_at                  | Fecha_de_inspecci_n           |
| modelo                      | Modelo_de_vehiculo            |
| matricula                   | Matricula                     |
| kilometraje                 | Kilometraje                   |
| nivel_deposito_refrigerante | Deposito_refrigerante_en_frio |
| nivel_liquido_frenos        | Liquido_de_frenos             |
| nivel_aceite_motor          | Aceite_de_motor               |
| nivel_agua_limpia           | Aguas_limpias                 |
| pedales_acelerador          | Acelerador                    |
| pedales_embrague            | Embrague                      |
| pedales_freno               | Freno                         |
| luces                       | Luces                         |
| luces_intermitentes         | Intermitentes_warning         |
| luces_matricula             | Luces_Matr_cula               |
| luces_freno                 | Luces_Freno                   |
| luces_antinieblas           | Antinieblas                   |
| luces_marcha_atras          | Marcha_Atr_s                  |
| luces_interiores            | Luces_interiores              |
| observaciones               | Observaciones                 |
| photos                      | Fotos (array de URLs)         |
| url_pdf                     | PDF (URL pública)             |
| id                          | ID_Inspecci_n                 |
| status (al aprobar)         | Estado = "Aprobada"           |

### Sistema de Tokens Zoho

- Se usa un **Refresh Token** permanente para obtener Access Tokens
- Los Access Tokens expiran en 1 hora (3600 segundos)
- Se implementa caché del access token para no pedir uno nuevo en cada request
- Si el token está expirado o no existe, se refresca automáticamente

### Variables de entorno necesarias para Zoho API

```
ZOHO_CLIENT_ID        - Client ID de la aplicación Zoho
ZOHO_CLIENT_SECRET    - Client Secret de la aplicación Zoho
ZOHO_REFRESH_TOKEN    - Refresh token (no expira)
ZOHO_ACCOUNT_URL      - https://accounts.zoho.com
ZOHO_API_URL          - https://www.zohoapis.com
ZOHO_API_VERSION      - v6
```

---

## 📧 SISTEMA DE EMAILS

### Email: "Nueva inspección creada"

**Cuándo se envía:** Inmediatamente después de crear una inspección exitosamente

**Destinatarios:**

- TO: Email del inspector que creó la inspección
- BCC: Todos los usuarios con rol admin

**Contenido:**

- Logo de la empresa
- Título: "Nueva Inspección Creada"
- Tabla con:
    - Fecha de la inspección
    - Nombre del inspector responsable
    - Modelo del vehículo
    - Matrícula del vehículo
- Botón: "Ver Inspección" (link a la app)
- Footer con contacto de soporte

---

## 📄 GENERACIÓN DE PDF

### Contenido del PDF generado

1. **Encabezado:**
    - Logo de la empresa (izquierda)
    - Título "INSPECCIÓN VEHÍCULOS" (derecha)

2. **Datos principales (tabla):**
    - Responsable: nombre del inspector
    - Fecha: fecha y hora de la inspección
    - Matrícula del vehículo
    - Modelo del vehículo
    - Kilometraje

3. **Checklist (tabla):**
    - Sección "Niveles" (4 items)
    - Sección "Pedales" (3 items)
    - Sección "Luces" (7 items)
    - Cada item muestra "Bien" o "Mal"

4. **Fotos (grid 3x2):**
    - Las 6 fotos con sus etiquetas

5. **Observaciones:**
    - Texto libre si se ingresó

6. **Firma:**
    - Imagen de la firma digital
    - Texto "Firma de responsable"

---

## 🚀 RECOMENDACIONES DE MEJORA PARA EL NUEVO SISTEMA

### 1. Sistema de Roles más Granular

El sistema actual tiene solo 2 roles básicos. Considera implementar:

| Rol              | Descripción               | Capacidades                                       |
| ---------------- | ------------------------- | ------------------------------------------------- |
| super_admin      | Administrador del sistema | Todo, incluido gestión de configuración           |
| supervisor       | Supervisor de área        | Ver todas las inspecciones, aprobar, ver reportes |
| inspector_senior | Inspector con experiencia | Crear inspecciones, ver historial de otros        |
| inspector        | Inspector básico          | Solo crear y ver sus inspecciones                 |
| viewer           | Solo lectura              | Ver inspecciones y reportes sin modificar         |

### 2. Mejoras en el Flujo de Aprobación

- **Motivo de rechazo**: Permitir rechazar inspecciones con comentarios
- **Estados adicionales**: Pendiente → En revisión → Aprobada/Rechazada
- **Notificaciones**: Avisar al inspector cuando su inspección fue aprobada/rechazada
- **Re-inspección**: Si se rechaza, el inspector debe corregir y re-enviar

### 3. Gestión de Vehículos

- Crear entidad separada `Vehicle` con datos del vehículo
- Catálogo de vehículos de la flota
- Historial de inspecciones por vehículo
- Alertas de mantenimiento basadas en inspecciones

### 4. Checklist Configurable

- Permitir agregar/modificar items del checklist desde admin
- Categorías personalizables
- Items condicionales (si marca "Mal" en X, debe completar Y)

### 5. Mejoras en Fotografías

- Compresión automática de imágenes
- Validación de calidad mínima
- Marcas de agua automáticas (fecha, ubicación, inspector)
- Geolocalización de donde se tomó cada foto

### 6. Sistema de Alertas

- Notificar si un vehículo tiene demasiados "Mal" consecutivos
- Alertas por inspecciones vencidas (si no se inspecciona en X días)
- Dashboard de vehículos problemáticos

### 7. Reportes y Analytics

- Estadísticas de inspecciones por período
- Top de problemas más comunes
- Tiempo promedio de aprobación
- Exportación a Excel/CSV

### 8. Mejoras de UX

- Modo offline para inspecciones (sincronizar cuando hay conexión)
- Autoguardado del formulario
- Plantillas de inspección para vehículos recurrentes
- Escaneo de matrícula con cámara

### 9. Auditoría Completa

- Log de todas las acciones del sistema
- Quién hizo qué y cuándo
- Historial de cambios en inspecciones

### 10. Integración Expandida

- Webhook cuando se aprueba una inspección
- API pública para integraciones externas
- Integración con calendarios (programar inspecciones)

---

## ⚠️ CONSIDERACIONES TÉCNICAS PARA NEXT.JS

### Almacenamiento de Archivos

El sistema actual guarda archivos en storage local. Para producción en Next.js considera:

- Vercel Blob si usas Vercel
- Cloudflare R2 (compatible S3, económico)
- AWS S3
- UploadThing (simplifica uploads en Next.js)

### Generación de PDFs

En entornos serverless (Vercel), Puppeteer puede ser problemático. Alternativas:

- @react-pdf/renderer - Genera PDFs desde React
- Servicios externos como DocSpring, Anvil
- Edge Function con html-to-pdf

### Sistema de Emails

- Resend - Moderno, buen DX
- SendGrid - Robusto, escalable
- AWS SES - Económico a escala

### Caché de Tokens Zoho

En entorno serverless, la memoria no persiste. Usa:

- Redis (Upstash es serverless-friendly)
- Base de datos (tabla de tokens)

---

## 📝 RESUMEN DE ENTIDADES

### Para tu schema de Prisma necesitarás:

**User:**

- id, name, email (unique), zoho_user_id, avatar, timestamps
- Relación: hasMany Inspection, hasMany Approbation

**Inspection:**

- id, modelo, matricula, kilometraje
- 14 campos boolean de checklist
- observaciones (opcional)
- 6 campos de URLs de fotos
- url_pdf, status, zohoRecordId
- user_id (FK), timestamps
- Relación: belongsTo User, hasOne Approbation

**Approbation:**

- id, user_id (FK aprobador), inspection_id (FK), timestamps
- Relaciones: belongsTo User, belongsTo Inspection

**Role y Permission:**

- Usa una librería como next-auth con roles o implementa tu propio sistema

---

## 🎯 OBJETIVO FINAL

Implementar este módulo de inspecciones de vehículos en la aplicación Next.js existente, manteniendo la misma lógica de negocio del sistema Laravel pero aprovechando las mejoras propuestas y las capacidades del stack moderno (Prisma, Shadcn, React Hook Form, Zod, etc.).

La autenticación con Zoho ya está funcionando, así que solo necesitas:

1. Asegurarte de almacenar el `zoho_user_id` del usuario autenticado
2. Implementar el sistema de roles
3. Desarrollar todas las funcionalidades descritas
4. Integrar con la API de Zoho CRM

**Tienes libertad para mejorar la UX, proponer mejores estructuras de datos, y agregar funcionalidades que consideres valiosas.**
