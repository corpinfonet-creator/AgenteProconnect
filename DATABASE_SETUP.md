# Configuración de Base de Datos para Agente Proconnect

## 🗄️ Base de Datos: Neon (PostgreSQL Serverless)

Este proyecto usa **Neon** como base de datos PostgreSQL serverless, que es la integración oficial recomendada por Vercel.

---

## 📋 Pasos para Configurar la Base de Datos en Vercel

### **1. Crear Base de Datos Neon desde Vercel**

1. Ve a tu proyecto en Vercel: https://vercel.com/dashboard
2. Selecciona tu proyecto: **AgenteProconnect**
3. Ve a **"Storage"** en el menú lateral
4. Click en **"Create Database"**
5. Selecciona **"Neon Postgres"**
6. Click en **"Create"**

### **2. Vercel configurará automáticamente:**

✅ La base de datos Neon
✅ La variable de entorno `POSTGRES_URL`
✅ La conexión entre Vercel y Neon

### **3. Verificar Variables de Entorno**

1. Ve a **Settings** → **Environment Variables**
2. Deberías ver:
   - `POSTGRES_URL`
   - `POSTGRES_URL_NON_POOLING`
   - `POSTGRES_USER`
   - `POSTGRES_HOST`
   - `POSTGRES_PASSWORD`
   - `POSTGRES_DATABASE`

### **4. Hacer Re-deploy**

1. Ve a **Deployments**
2. Click en **"Redeploy"** en el último deployment
3. O haz un nuevo `git push` al repositorio

---

## 🔧 Configuración Local (Opcional)

Si quieres probar con base de datos en local:

### **Opción A: Usar Neon en desarrollo**

1. Ve a https://console.neon.tech/
2. Copia tu `POSTGRES_URL`
3. Crea archivo `.env` en la raíz del proyecto:

```env
POSTGRES_URL=postgresql://user:password@host/database?sslmode=require
```

### **Opción B: PostgreSQL local**

1. Instala PostgreSQL localmente
2. Crea una base de datos:

```bash
createdb agente_proconnect
```

3. Configura `.env`:

```env
POSTGRES_URL=postgresql://localhost:5432/agente_proconnect
```

---

## 📊 Esquema de Base de Datos

El esquema se crea automáticamente al iniciar la aplicación:

### **Tabla: users**
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'user' NOT NULL,
    avatar VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### **Tabla: sessions**
```sql
CREATE TABLE sessions (
    id VARCHAR(255) PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## ✅ Verificar que Funciona

Después de configurar la base de datos:

1. Ve a: https://agente-proconnect.vercel.app/
2. Intenta **registrar** un nuevo usuario
3. **Inicia sesión** con el usuario creado
4. Los datos ahora son **persistentes** (no se pierden al reiniciar)

---

## 🔄 Modo Fallback

Si NO configuras la base de datos:

- ⚠️ El sistema funcionará en **modo memoria**
- ⚠️ Los datos se **borrarán al reiniciar** el servidor
- ⚠️ Verás advertencias en los logs

Para producción, **siempre configura la base de datos**.

---

## 🛠️ Usuarios Demo

Al configurar la base de datos, se crean automáticamente:

```
Admin:
📧 admin@proconnect.com
🔑 admin123

Demo:
📧 demo@proconnect.com
🔑 demo123
```

---

## 📝 Notas Importantes

- Las contraseñas se hashean con **bcrypt** (10 rounds)
- Las sesiones expiran en **7 días**
- Las sesiones expiradas se limpian cada **1 hora**
- Conexión segura con **SSL** en producción

---

## 🆘 Solución de Problemas

### **Error: "POSTGRES_URL no configurado"**

**Solución:** Crea la base de datos Neon en Vercel Storage

### **Error: "Connection timeout"**

**Solución:** Verifica que la URL incluya `?sslmode=require`

### **Los datos se pierden**

**Solución:** Asegúrate de que `POSTGRES_URL` esté configurado en Vercel

---

## 📚 Más Información

- **Neon Docs:** https://neon.tech/docs
- **Vercel Storage:** https://vercel.com/docs/storage
- **Vercel Postgres Transition:** https://neon.com/docs/guides/vercel-postgres-transition-guide
