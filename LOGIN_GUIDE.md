# 🔐 Guía Completa del Sistema de Login

## ✅ Estado Actual

El sistema de login está **completamente funcional** tanto localmente como en producción (una vez configuradas las variables de entorno en Vercel).

---

## 🧪 Tests Pasados Localmente

```bash
npm run test:login
```

**Resultados:**
```
✅ Conexión a base de datos: OK (2 usuarios)
✅ Login con admin@proconnect.com: OK
✅ Creación de sesiones: OK
✅ Validación de sesiones: OK
✅ Login con demo@proconnect.com: OK
✅ Rechazo de credenciales incorrectas: OK
```

---

## 🔐 Credenciales de Prueba

### Administrador
```
📧 Email: admin@proconnect.com
🔑 Password: admin123
👤 Rol: admin
```

### Usuario Demo
```
📧 Email: demo@proconnect.com
🔑 Password: demo123
👤 Rol: user
```

---

## 🚀 Cómo Probar el Login

### En Producción (Vercel)

1. **Asegúrate de que `POSTGRES_URL` esté configurado en Vercel**
   - Ve a: Vercel Dashboard → Settings → Environment Variables
   - Verifica que `POSTGRES_URL` esté presente
   - Si no está, agrégala y haz redeploy

2. **Ve a la página de login**
   ```
   https://agente-proconnect.vercel.app/
   ```

3. **Ingresa credenciales**
   - Email: `admin@proconnect.com`
   - Password: `admin123`

4. **Click en "Iniciar Sesión"**

5. **Deberías ser redirigido a:**
   ```
   https://agente-proconnect.vercel.app/dashboard
   ```

### En Local

1. **Asegúrate de tener `.env` configurado**
   ```env
   POSTGRES_URL=postgresql://neondb_owner:npg_siwA0tIb9XZd@ep-patient-sky-adorkpt9-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require
   ```

2. **Inicia el servidor**
   ```bash
   npm run dev
   ```

3. **Ve a**
   ```
   http://localhost:3000/
   ```

4. **Usa las credenciales de prueba**

---

## 🔄 Flujo Completo del Login

### 1. Usuario ingresa credenciales
```
Email: admin@proconnect.com
Password: admin123
```

### 2. Frontend envía POST a `/api/auth/login`
```json
{
  "email": "admin@proconnect.com",
  "password": "admin123"
}
```

### 3. Backend valida credenciales
- Busca usuario por email en la BD
- Compara password con bcrypt
- Actualiza `last_login`

### 4. Backend crea sesión
- Genera ID de sesión único
- Guarda en tabla `sessions` con:
  - `id`: ID de sesión
  - `user_id`: ID del usuario
  - `expires_at`: Fecha de expiración (7 días)

### 5. Backend establece cookie
```
Cookie: session=<sessionId>
HttpOnly: true
Secure: true (en producción)
SameSite: lax
MaxAge: 604800 (7 días)
```

### 6. Backend responde con datos del usuario
```json
{
  "success": true,
  "message": "Inicio de sesión exitoso",
  "user": {
    "id": 1,
    "email": "admin@proconnect.com",
    "name": "Administrador",
    "role": "admin"
  }
}
```

### 7. Frontend redirige al dashboard
```javascript
window.location.href = '/dashboard';
```

---

## 🛡️ Seguridad Implementada

### Contraseñas
- ✅ Hasheadas con **bcrypt** (10 rounds)
- ✅ Nunca se envían en texto plano
- ✅ Nunca se retornan en las respuestas

### Sesiones
- ✅ IDs únicos generados con timestamp + random
- ✅ Almacenadas en base de datos
- ✅ Cookies HttpOnly (no accesibles desde JS)
- ✅ Cookies Secure en producción (solo HTTPS)
- ✅ SameSite: lax (protección CSRF)
- ✅ Expiración automática (7 días)
- ✅ Limpieza automática de sesiones expiradas

### Validaciones
- ✅ Formato de email
- ✅ Campos requeridos
- ✅ Longitud mínima de contraseña (6 caracteres)
- ✅ Confirmación de contraseña en registro

---

## 📊 Endpoints de Autenticación

### POST `/api/auth/login`
**Iniciar sesión**

Request:
```json
{
  "email": "admin@proconnect.com",
  "password": "admin123"
}
```

Response exitoso (200):
```json
{
  "success": true,
  "message": "Inicio de sesión exitoso",
  "user": {
    "id": 1,
    "email": "admin@proconnect.com",
    "name": "Administrador",
    "role": "admin",
    "created_at": "2024-01-01T00:00:00.000Z"
  }
}
```

Response error (401):
```json
{
  "statusCode": 401,
  "message": "Email o contraseña incorrectos"
}
```

### POST `/api/auth/register`
**Registrar nuevo usuario**

Request:
```json
{
  "name": "Juan Pérez",
  "email": "juan@example.com",
  "password": "mipassword123"
}
```

Response exitoso (200):
```json
{
  "success": true,
  "message": "Usuario registrado exitosamente",
  "user": {
    "id": 3,
    "email": "juan@example.com",
    "name": "Juan Pérez",
    "role": "user"
  }
}
```

### POST `/api/auth/logout`
**Cerrar sesión**

Request: (vacío)

Response:
```json
{
  "success": true,
  "message": "Sesión cerrada exitosamente"
}
```

### GET `/api/auth/me`
**Obtener usuario actual**

Response (si está autenticado):
```json
{
  "success": true,
  "user": {
    "id": 1,
    "email": "admin@proconnect.com",
    "name": "Administrador",
    "role": "admin"
  },
  "session": {
    "createdAt": "2024-01-01T10:00:00.000Z",
    "expiresAt": "2024-01-08T10:00:00.000Z"
  }
}
```

Response (sin autenticar):
```json
{
  "statusCode": 401,
  "message": "No autenticado"
}
```

---

## 🔍 Diagnóstico

### Verificar estado del sistema
```
GET /api/status
```

Respuesta esperada (con BD configurada):
```json
{
  "status": "ok",
  "database": {
    "postgres_url_configured": true,
    "type": "Neon PostgreSQL",
    "status": "✅ Conectado"
  }
}
```

### Health check simple
```
GET /api/health
```

Respuesta esperada:
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T10:00:00.000Z",
  "database": "configurado"
}
```

---

## 🆘 Solución de Problemas

### Error: "Email o contraseña incorrectos"
**Causas:**
- Credenciales incorrectas
- Usuario no existe en la BD
- Base de datos no configurada (usando modo memoria)

**Solución:**
1. Verifica credenciales
2. Usa credenciales demo: `admin@proconnect.com` / `admin123`
3. Verifica que `POSTGRES_URL` esté configurado en Vercel

### Error 500 al hacer login
**Causas:**
- `POSTGRES_URL` no configurado en Vercel
- bcrypt no compilado correctamente
- Error de conexión a base de datos

**Solución:**
1. Verifica variables de entorno en Vercel
2. Haz redeploy sin caché
3. Revisa logs en Vercel: Deployments → Runtime Logs

### Login exitoso pero no redirige
**Causas:**
- JavaScript deshabilitado
- Error en el código del frontend

**Solución:**
1. Abre consola del navegador (F12)
2. Busca errores de JavaScript
3. Verifica que `/dashboard` existe

### Sesión se pierde al recargar
**Causas:**
- Cookies bloqueadas
- Navegador en modo incógnito
- Cookie no se está estableciendo

**Solución:**
1. Verifica que las cookies estén habilitadas
2. Abre DevTools → Application → Cookies
3. Busca cookie llamada `session`

---

## 📚 Archivos Relacionados

```
server/
├── api/auth/
│   ├── login.post.ts          # Login
│   ├── register.post.ts       # Registro
│   ├── logout.post.ts         # Logout
│   └── me.get.ts             # Usuario actual
├── lib/auth/
│   ├── users.ts              # Servicio de usuarios
│   └── session.ts            # Servicio de sesiones
├── lib/db/
│   └── client.ts             # Cliente de BD
└── routes/
    ├── index.get.ts          # Página de login
    ├── register.get.ts       # Página de registro
    └── dashboard.get.ts      # Dashboard (protegido)

scripts/
├── init-database.ts          # Inicializar BD
└── test-login.ts            # Tests de login
```

---

## ✅ Checklist de Verificación

- [ ] Variables de entorno configuradas en Vercel
- [ ] Base de datos Neon creada
- [ ] Usuarios demo en la BD
- [ ] Redeploy realizado
- [ ] `/api/health` responde OK
- [ ] `/api/status` muestra BD conectada
- [ ] Login con admin funciona
- [ ] Redirige al dashboard
- [ ] Dashboard muestra datos del usuario
- [ ] Logout funciona
- [ ] Registro de nuevos usuarios funciona

---

## 🎯 Próximos Pasos

Una vez que el login funcione en producción:

1. ✅ **Recuperación de contraseña** (envío de email)
2. ✅ **Verificación de email** (confirmación)
3. ✅ **OAuth** (Google, GitHub, Slack)
4. ✅ **2FA** (autenticación de dos factores)
5. ✅ **Panel de administración** (gestión de usuarios)
6. ✅ **Logs de actividad** (auditoría)

---

**¿Listo para probar? Ve a https://agente-proconnect.vercel.app/ y usa las credenciales demo!** 🚀
