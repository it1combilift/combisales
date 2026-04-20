# CombiSales

Documentacion tecnica para levantar el proyecto en local y empezar a contribuir.

## Tabla de contenidos

- [1. Introduccion](#1-introduccion)
- [2. Tecnologias utilizadas](#2-tecnologias-utilizadas)
- [3. Instalacion y ejecucion en local](#3-instalacion-y-ejecucion-en-local)
- [4. Estructura de carpetas](#4-estructura-de-carpetas)
- [5. Rutas y Endpoints](#5-rutas-y-endpoints)
- [6. Componentes y paginas principales](#6-componentes-y-paginas-principales)
- [7. Flujo general del sistema](#7-flujo-general-del-sistema)
- [8. Notas adicionales / Proximos pasos](#8-notas-adicionales--proximos-pasos)

## 1. Introduccion

CombiSales es una aplicacion web para gestion comercial y operativa de Combilift. Centraliza:

- Gestion de usuarios y roles (admin, dealer, seller, inspector).
- Seguimiento de tareas, clientes, visitas y formularios tecnicos.
- Gestion de inspecciones de vehiculos (incluye aprobaciones y PDF).
- Integracion con Zoho CRM (accounts, contacts, leads, projects y tasks).

Esta guia esta pensada para que cualquier desarrollador pueda levantar el proyecto y entender su estructura en menos de 10 minutos.

## 2. Tecnologias utilizadas

Stack principal del proyecto:

| Tecnologia                | Uso en el proyecto                                  |
| ------------------------- | --------------------------------------------------- |
| Next.js 16 (App Router)   | Frontend y backend (API Routes) en un solo proyecto |
| React 18 + TypeScript     | UI tipada y componentes reutilizables               |
| Tailwind CSS 4 + Radix UI | Estilos y componentes base de interfaz              |
| NextAuth                  | Autenticacion y sesiones                            |
| Prisma + PostgreSQL       | ORM y persistencia de datos                         |
| SWR + Axios               | Fetching en cliente y mutaciones HTTP               |
| React Hook Form + Zod     | Formularios y validacion                            |
| Cloudinary                | Carga y gestion de archivos multimedia              |
| Resend                    | Envio de emails transaccionales                     |
| Puppeteer / Chromium      | Generacion de PDF en servidor                       |

## 3. Instalacion y ejecucion en local

### Requisitos previos

- Node.js 20 o superior.
- pnpm (recomendado, hay `pnpm-lock.yaml`) o npm.
- Base de datos PostgreSQL accesible desde tu entorno.

### 1) Clonar el repositorio

```bash
git clone <URL_DEL_REPOSITORIO>
cd combisales
```

### 2) Configurar variables de entorno

Crea un archivo `.env` en la raiz del proyecto. Usa este template (sin valores reales):

```env
# General
PORT=3000
NODE_ENV=development

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=tu_secret_seguro

# Database
DATABASE_URL=postgresql://usuario:password@host:5432/dbname

# Zoho
ZOHO_CLIENT_ID=
ZOHO_CLIENT_SECRET=
ZOHO_DESK_DEPARTMENT_ID=
ZOHO_DESK_ORG_ID=

# Cloudinary
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
CLOUDINARY_URL=

# Email (Resend)
RESEND_API_KEY=
```

### 3) Instalar dependencias

Con pnpm:

```bash
pnpm install
```

Con npm:

```bash
npm install
```

### 4) Preparar Prisma

```bash
# Genera cliente Prisma
pnpm prisma:generate

# Aplica migraciones en local
pnpm prisma:migrate
```

Si usas npm:

```bash
npm run prisma:generate
npm run prisma:migrate
```

### 5) Levantar el proyecto

```bash
pnpm dev
```

Abre `http://localhost:3000`.

### Scripts utiles

| Script                  | Descripcion                             |
| ----------------------- | --------------------------------------- |
| `dev`                   | Inicia entorno local                    |
| `build`                 | Genera cliente Prisma y compila Next.js |
| `start`                 | Inicia build de produccion              |
| `lint`                  | Ejecuta ESLint                          |
| `prisma:generate`       | Regenera cliente Prisma                 |
| `prisma:migrate`        | Crea/aplica migraciones en desarrollo   |
| `prisma:migrate:deploy` | Aplica migraciones en despliegue        |
| `prisma:studio`         | Abre Prisma Studio                      |
| `prisma:push`           | Sincroniza schema sin migracion         |

## 4. Estructura de carpetas

Vista general de alto nivel:

```text
app/
	layout.tsx                 # Layout global
	page.tsx                   # Landing/login root
	(protected)/dashboard/     # Seccion principal autenticada
	api/                       # API Routes (backend)

components/
	ui/                        # Primitivas UI reutilizables
	auth/                      # Login/Auth UI
	inspections/               # Modulo de inspecciones
	users/                     # Formularios y tablas de usuarios
	dealers/, tasks/, visits/  # Modulos funcionales del dashboard

lib/                         # Helpers de negocio/integraciones (Prisma, emails, roles, Zoho)
prisma/                      # schema.prisma y migraciones
schemas/                     # Esquemas Zod
interfaces/                  # Tipos e interfaces de dominio
hooks/                       # Hooks compartidos
locales/                     # i18n (es/en)
data/                        # Data local (ej. equipment.json)
```

## 5. Rutas y Endpoints

### API Routes

#### Auth

| Ruta                      | Metodo   | Descripcion                        | Notas              |
| ------------------------- | -------- | ---------------------------------- | ------------------ |
| `/api/auth/[...nextauth]` | GET/POST | Flujo de autenticacion y callbacks | NextAuth           |
| `/api/auth/logs`          | GET      | Logs de autenticacion              | Uso administrativo |
| `/api/auth/me`            | GET      | Perfil del usuario autenticado     | Requiere sesion    |
| `/api/auth/update`        | PATCH    | Actualizacion de perfil y password | Requiere sesion    |

#### Customers / Help / Email / Equipment / Upload

| Ruta                 | Metodo     | Descripcion                       | Notas                       |
| -------------------- | ---------- | --------------------------------- | --------------------------- |
| `/api/customers`     | GET/POST   | Consulta y upsert de clientes     | Integrado con contexto Zoho |
| `/api/help`          | POST       | Envio de solicitudes de ayuda     | Puede adjuntar archivos     |
| `/api/email`         | POST       | Envio de correo saliente          | Usa Resend                  |
| `/api/equipment`     | GET        | Retorna catalogo de equipos       | Lee `data/equipment.json`   |
| `/api/upload`        | POST       | Subida de archivos                | Cloudinary                  |
| `/api/upload/[id]`   | GET/DELETE | Obtener o eliminar archivo por id | Gestion de adjuntos         |
| `/api/upload/delete` | POST       | Eliminacion masiva/dirigida       | Apoyo a formularios         |

#### Inspections

| Ruta                             | Metodo         | Descripcion                                  | Notas                                         |
| -------------------------------- | -------------- | -------------------------------------------- | --------------------------------------------- |
| `/api/inspections`               | GET/POST       | Listado y creacion de inspecciones           | Incluye relaciones (vehiculo, usuario, fotos) |
| `/api/inspections/[id]`          | GET/PUT/DELETE | Detalle, edicion y borrado de inspeccion     | Control por roles                             |
| `/api/inspections/[id]/approve`  | POST           | Aprobar/rechazar inspeccion                  | Generalmente admin                            |
| `/api/inspections/[id]/pdf`      | GET            | Genera PDF de inspeccion                     | Usa Puppeteer/Chromium                        |
| `/api/inspections/reminders`     | GET/PUT        | Lee/actualiza configuracion de recordatorios | Frecuencia semanal/mensual                    |
| `/api/inspections/reminders/run` | POST           | Ejecuta envio de recordatorios               | Ejecucion manual/cron                         |

#### Users

| Ruta                          | Metodo         | Descripcion                        | Notas                     |
| ----------------------------- | -------------- | ---------------------------------- | ------------------------- |
| `/api/users`                  | GET            | Lista usuarios con filtros por rol | Admin                     |
| `/api/users/[id]`             | GET/PUT/DELETE | Gestion de usuario puntual         | Admin                     |
| `/api/users/assigned-sellers` | GET            | Sellers asignados al dealer actual | Dealer                    |
| `/api/users/create`           | POST           | Alta de usuario                    | Roles y validaciones      |
| `/api/users/delete-multiple`  | POST           | Eliminacion multiple               | Admin                     |
| `/api/users/list`             | GET            | Variante de listado simplificado   | Soporte UI                |
| `/api/users/revoke-session`   | POST           | Revocar sesion activa              | Seguridad                 |
| `/api/users/sellers`          | GET            | Lista de sellers                   | Selectores y asignaciones |

#### Vehicles / Visits

| Ruta                     | Metodo         | Descripcion                       | Notas                           |
| ------------------------ | -------------- | --------------------------------- | ------------------------------- |
| `/api/vehicles`          | GET/POST       | Lista y crea vehiculos            | Admin ve todos, otros filtrados |
| `/api/vehicles/[id]`     | GET/PUT/DELETE | Gestion de vehiculo por id        | Asignaciones a inspector/seller |
| `/api/visits`            | GET/POST       | Listado y creacion de visitas     | Varios tipos de formulario      |
| `/api/visits/[id]`       | GET/PUT/DELETE | Detalle y mantenimiento de visita | Flujo de edicion                |
| `/api/visits/[id]/clone` | POST           | Clonar visita existente           | Reuso de formulario             |

#### Zoho

| Ruta                      | Metodo | Descripcion                   | Notas                 |
| ------------------------- | ------ | ----------------------------- | --------------------- |
| `/api/zoho/accounts`      | GET    | Lista cuentas de Zoho         | Paginacion/filtros    |
| `/api/zoho/accounts/[id]` | GET    | Detalle de cuenta de Zoho     | Control por owner/rol |
| `/api/zoho/contacts`      | GET    | Lista contactos de Zoho       | Filtrable por cuenta  |
| `/api/zoho/contacts/[id]` | GET    | Detalle de contacto Zoho      | Control por owner/rol |
| `/api/zoho/leads`         | GET    | Lista leads de Zoho           | Paginacion/filtros    |
| `/api/zoho/leads/[id]`    | GET    | Detalle de lead Zoho          | Control por owner/rol |
| `/api/zoho/projects`      | GET    | Lista proyectos/deals Zoho    | Paginacion/filtros    |
| `/api/zoho/projects/[id]` | GET    | Detalle de proyecto/deal Zoho | Control por owner/rol |
| `/api/zoho/tasks`         | GET    | Lista tareas de Zoho          | Paginacion/filtros    |
| `/api/zoho/tasks/[id]`    | GET    | Detalle de tarea Zoho         | Control por owner/rol |

### Frontend Routes

| Ruta                                              | Metodo | Descripcion                                      | Notas                               |
| ------------------------------------------------- | ------ | ------------------------------------------------ | ----------------------------------- |
| `/`                                               | GET    | Entrada principal (login/home)                   | Publica                             |
| `/_not-found`                                     | GET    | Pantalla 404                                     | Fallback                            |
| `/dashboard`                                      | GET    | Home del dashboard                               | Requiere autenticacion              |
| `/dashboard/[...not-found]`                       | GET    | Not found interno dashboard                      | Fallback de seccion protegida       |
| `/dashboard/clients`                              | GET    | Lista de clientes (Zoho)                         | Tabla + filtros                     |
| `/dashboard/clients/visits/[id]`                  | GET    | Historial de visitas por cliente                 | Gestion de visitas                  |
| `/dashboard/clients/visits/[id]/detail/[visitId]` | GET    | Detalle de visita de cliente                     | Modo vista/edicion                  |
| `/dashboard/dealers`                              | GET    | Panel de dealers y visitas                       | Rol dealer/admin                    |
| `/dashboard/dealers/visits/[visitId]`             | GET    | Detalle de visita en flujo dealer                | Incluye clonacion/edicion segun rol |
| `/dashboard/equipment`                            | GET    | Catalogo de maquinaria                           | Basado en data local/API            |
| `/dashboard/help`                                 | GET    | Soporte y envio de tickets                       | Adjuntos permitidos                 |
| `/dashboard/inspections`                          | GET    | Gestion de inspecciones, vehiculos e inspectores | Modulo principal de inspeccion      |
| `/dashboard/inspections/[id]`                     | GET    | Detalle de inspeccion                            | Aprobar, borrar, generar PDF        |
| `/dashboard/profile`                              | GET    | Perfil del usuario                               | Actualizacion de datos              |
| `/dashboard/tasks`                                | GET    | Tareas de Zoho                                   | Tabla, busqueda y acciones          |
| `/dashboard/tasks/[id]/details`                   | GET    | Detalle de tarea Zoho                            | Contexto de cliente y visitas       |
| `/dashboard/tasks/[id]/visits/[visitId]`          | GET    | Detalle de visita desde tarea                    | Flujo contextual                    |
| `/dashboard/users`                                | GET    | Gestion de usuarios                              | CRUD + asignaciones                 |

## 6. Componentes y paginas principales

Resumen de piezas clave para ubicarse rapido:

| Area                  | Componentes/Paginas clave                                                                                                  | Funcion                                                           |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| Layout dashboard      | `app/(protected)/dashboard/layout.tsx`, `components/app-sidebar.tsx`, `components/site-header.tsx`                         | Shell principal autenticado, navegacion y header                  |
| Autenticacion         | `components/auth/login-form.tsx`, `app/api/auth/*`                                                                         | Login, sesion y gestion de perfil                                 |
| Inspecciones          | `app/(protected)/dashboard/inspections/page.tsx`, `components/inspections/*`                                               | CRUD de inspecciones, vehiculos, inspectores, recordatorios y PDF |
| Usuarios              | `app/(protected)/dashboard/users/page.tsx`, `components/users/create-user-form.tsx`, `components/users/edit-user-form.tsx` | Administracion de usuarios, roles y asignaciones                  |
| Clientes y tareas     | `app/(protected)/dashboard/clients/page.tsx`, `app/(protected)/dashboard/tasks/page.tsx`                                   | Consumo de Zoho (tablas, busqueda, contexto)                      |
| Formularios de visita | `components/formulario-*-analisis/*`                                                                                       | Captura de datos tecnicos por tipo de visita                      |
| Integraciones         | `service/ZohoCRMService.ts`, `service/ZohoDeskService.ts`, `lib/cloudinary.ts`, `lib/resend.ts`                            | Conectores externos (Zoho, archivos, email)                       |

## 7. Flujo general del sistema

Flujo de alto nivel:

1. El usuario inicia sesion con NextAuth.
2. Middleware/proxy valida acceso y redirige al dashboard segun rol.
3. El dashboard consume API Routes internas para datos de usuarios, visitas, inspecciones y vehiculos.
4. En paralelo, los modulos de clientes/tareas consultan Zoho usando tokens almacenados.
5. En formularios y modulos de inspeccion:
   - Se valida entrada con Zod.
   - Se persiste con Prisma en PostgreSQL.
   - Se suben adjuntos a Cloudinary cuando aplica.
   - Se envian notificaciones por email con Resend en eventos clave.
6. Para inspecciones, se puede aprobar/rechazar y generar PDF desde endpoint dedicado.

## 8. Notas adicionales / Proximos pasos

- Seguridad: rota inmediatamente cualquier secreto expuesto en repositorios/entornos compartidos.
- Convenciones: manten validaciones en `schemas/`, logica de integracion en `lib/` y `service/`.
- Prisma: despues de cambios en `schema.prisma`, ejecuta `prisma:generate` y migraciones.
- i18n: textos en `locales/es.json` y `locales/en.json`.
- Checklist recomendado para contribuciones:
  1.  Levantar en local y validar login.
  2.  Probar al menos un flujo completo (ej. tareas -> visita -> guardado).
  3.  Revisar permisos por rol en UI y API.
  4.  Ejecutar `lint` y `build` antes de abrir PR.
