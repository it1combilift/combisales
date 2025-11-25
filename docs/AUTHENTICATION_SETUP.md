# 🔐 Sistema de Autenticación Mejorado

## 📋 Resumen de la Refactorización

Esta refactorización implementa un sistema de autenticación empresarial robusto con soporte para:

- ✅ **OAuth 2.0 con Zoho** (con refresh automático de tokens)
- ✅ **Autenticación por credenciales** (email/password)
- ✅ **Auditoría completa** de eventos de autenticación
- ✅ **Gestión de múltiples cuentas** por usuario
- ✅ **Token refresh proactivo** vía cron job
- ✅ **Validación en tiempo real** del estado de cuentas

---

## 🗂️ Cambios en el Schema de Base de Datos

### Nuevos Campos en `Account`

```prisma
model Account {
  zoho_org_id       String?   // ID de organización de Zoho
  api_domain        String?   // Dominio de API de Zoho
  token_refreshed_at DateTime? // Última vez que se refrescó el token
  token_expires_in  Int?      // Tiempo de expiración del token en segundos
}
```

### Nuevos Campos en `Session`

```prisma
model Session {
  ipAddress  String? // IP desde donde se inició la sesión
  userAgent  String? // User-Agent del navegador
}
```

### Nueva Tabla: `AuthAuditLog`

```prisma
model AuthAuditLog {
  id        String   @id @default(cuid())
  userId    String?
  email     String?
  event     String   // LOGIN_SUCCESS, LOGIN_FAILED, TOKEN_REFRESH, etc.
  provider  String?  // zoho, credentials
  ipAddress String?
  userAgent String?
  metadata  Json?    // Información adicional del evento
  createdAt DateTime @default(now())
}
```

---

## 🚀 Configuración

### 1. Variables de Entorno

Agregar a tu archivo `.env`:

```env
# Cron Job Security (generar con: openssl rand -base64 32)
CRON_SECRET="tu-clave-secreta-para-cron"
```

### 2. Aplicar Cambios de Schema

```bash
# Sincronizar base de datos con el nuevo schema
npx prisma db push

# Regenerar cliente de Prisma
npx prisma generate
```

### 3. Configurar Cron Job en Vercel

El archivo `vercel.json` ya está configurado para ejecutar el cron job cada 50 minutos:

```json
{
  "crons": [
    {
      "path": "/api/cron/refresh-tokens",
      "schedule": "0/50 * * * *"
    }
  ]
}
```

En **Vercel Dashboard**:

1. Ve a tu proyecto → **Settings** → **Environment Variables**
2. Agrega `CRON_SECRET` con el valor generado
3. Despliega tu aplicación

---

## 📊 Eventos de Auditoría

El sistema registra automáticamente los siguientes eventos en `AuthAuditLog`:

| Evento                  | Descripción                      | Provider          |
| ----------------------- | -------------------------------- | ----------------- |
| `USER_CREATED`          | Usuario creado por primera vez   | zoho              |
| `LOGIN_SUCCESS`         | Inicio de sesión exitoso         | zoho, credentials |
| `LOGIN_FAILED`          | Intento de login fallido         | zoho, credentials |
| `LOGIN_BLOCKED`         | Cuenta bloqueada intentó acceder | zoho, credentials |
| `TOKEN_REFRESH_SUCCESS` | Token refrescado exitosamente    | zoho              |
| `TOKEN_REFRESH_FAILED`  | Error al refrescar token         | zoho              |
| `LOGOUT`                | Usuario cerró sesión             | zoho, credentials |

### Consultar Logs de Auditoría

```typescript
import { prisma } from "@/lib/prisma";

// Últimos 50 eventos de un usuario
const logs = await prisma.authAuditLog.findMany({
  where: { userId: "user-id" },
  orderBy: { createdAt: "desc" },
  take: 50,
});

// Intentos fallidos de login en las últimas 24 horas
const failedLogins = await prisma.authAuditLog.findMany({
  where: {
    event: "LOGIN_FAILED",
    createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
  },
});
```

---

## 🔄 Token Refresh Automático

### Flujo de Refresh

1. **Cron Job** se ejecuta cada 50 minutos
2. Busca cuentas OAuth con tokens que expiran en los próximos 10 minutos
3. Llama a Zoho para obtener un nuevo `access_token`
4. Actualiza `Account` con el nuevo token y timestamp
5. Registra el evento en `AuthAuditLog`

### Endpoint Manual

Para testing o refresh manual:

```bash
curl -X GET https://tu-app.vercel.app/api/cron/refresh-tokens \
  -H "Authorization: Bearer $CRON_SECRET"
```

---

## 🔒 Mejoras de Seguridad

### 1. Validación en Tiempo Real

El callback de `session` verifica en cada request si la cuenta sigue activa:

```typescript
// Si un admin desactiva un usuario, su sesión se invalida inmediatamente
if (!dbUser || !dbUser.isActive) {
  throw new Error("Tu cuenta ha sido bloqueada");
}
```

### 2. Manejo de Múltiples Cuentas

Un usuario puede tener:

- Una cuenta OAuth (Zoho)
- Una cuenta de credenciales (email/password)

Ambas comparten el mismo `User.id` pero tienen registros separados en `Account`.

### 3. Metadata de Sesión

Cada sesión registra:

- IP del cliente (`ipAddress`)
- User-Agent del navegador (`userAgent`)
- Provider utilizado (`zoho` o `credentials`)

---

## 📁 Estructura de Archivos Modificados

```
├── prisma/
│   └── schema.prisma                    # Schema actualizado con nuevos campos
├── app/api/
│   ├── auth/[...nextauth]/route.ts      # Callbacks mejorados con auditoría
│   └── cron/refresh-tokens/route.ts     # Cron job para refresh automático
├── interfaces/
│   └── next-auth.d.ts                   # Tipos actualizados de NextAuth
├── docs/
│   └── AUTHENTICATION_ARCHITECTURE.md   # Documentación técnica completa
├── vercel.json                          # Configuración del cron job
└── .env.example                         # Variables de entorno requeridas
```

---

## 🧪 Testing

### Probar Login con Zoho

```bash
# Visitar: http://localhost:3000
# Click en "Sign in with Zoho"
# Verificar en logs:
# - Console mostrará "=== ZOHO PROFILE DATA ==="
# - AuthAuditLog tendrá registro de LOGIN_SUCCESS
```

### Probar Login con Credenciales

```bash
# Visitar: http://localhost:3000
# Usar email y contraseña de un usuario existente
# Verificar en AuthAuditLog el registro de LOGIN_SUCCESS
```

### Probar Token Refresh Manual

```bash
# Obtener un account.id de un usuario OAuth
# Setear expires_at a tiempo próximo
UPDATE "Account" SET expires_at = EXTRACT(EPOCH FROM NOW())::INT + 300
WHERE provider = 'zoho' AND "userId" = 'user-id';

# Llamar al cron job
curl -X GET http://localhost:3000/api/cron/refresh-tokens \
  -H "Authorization: Bearer $CRON_SECRET"
```

---

## 📚 Documentación Adicional

Para detalles técnicos completos, consulta:

- [AUTHENTICATION_ARCHITECTURE.md](./docs/AUTHENTICATION_ARCHITECTURE.md)

---

## 🐛 Troubleshooting

### Error: "authAuditLog does not exist"

```bash
npx prisma db push
npx prisma generate
```

### Error: "CRON_SECRET not defined"

Agrega la variable en `.env` y en Vercel Dashboard.

### Tokens no se refrescan

1. Verifica que `vercel.json` esté en el root del proyecto
2. Confirma que el cron job esté activo en Vercel Dashboard
3. Revisa los logs del cron job en Vercel Functions

---

## ✅ Checklist de Deployment

- [ ] Variables de entorno configuradas (incluido `CRON_SECRET`)
- [ ] Schema sincronizado con `npx prisma db push`
- [ ] Cliente de Prisma regenerado con `npx prisma generate`
- [ ] `vercel.json` committeado al repositorio
- [ ] Cron job visible en Vercel Dashboard después del deploy
- [ ] Probar login con Zoho y credenciales
- [ ] Verificar registros en `AuthAuditLog`
- [ ] Confirmar que tokens se refrescan automáticamente

---

## 📞 Soporte

Para preguntas o issues, contacta al equipo de desarrollo.
