# 🚀 Configuración de Variables de Entorno en Vercel

## ✅ PASO A PASO

### 1. Acceder a Vercel Dashboard

Ve a: https://vercel.com/dashboard

### 2. Seleccionar tu Proyecto

Click en: **"AgenteProconnect"**

### 3. Ir a Settings

Click en **"Settings"** (menú superior)

### 4. Abrir Environment Variables

Click en **"Environment Variables"** (menú lateral izquierdo)

### 5. Agregar Variable Principal

Click en **"Add New"** y configura:

```
Name: POSTGRES_URL
Value: postgresql://neondb_owner:npg_siwA0tIb9XZd@ep-patient-sky-adorkpt9-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require
Environment: ✅ Production ✅ Preview ✅ Development (marca las 3)
```

Click en **"Save"**

### 6. Agregar Variable Alternativa (Opcional)

Para mayor compatibilidad, agrega también:

```
Name: DATABASE_URL
Value: postgresql://neondb_owner:npg_siwA0tIb9XZd@ep-patient-sky-adorkpt9-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require
Environment: ✅ Production ✅ Preview ✅ Development
```

### 7. Redeploy

Después de guardar las variables:

1. Ve a **"Deployments"** (menú superior)
2. Click en el botón **"..."** (tres puntos) del último deployment
3. Click en **"Redeploy"**
4. Marca: ☑️ **"Use existing Build Cache"** = NO (recomendado para aplicar cambios)
5. Click en **"Redeploy"**

### 8. Esperar

⏳ El deploy toma 1-2 minutos

### 9. Verificar

Una vez completado, ve a:

- **Health check:** https://agente-proconnect.vercel.app/api/health
- **Status:** https://agente-proconnect.vercel.app/api/status
- **Login:** https://agente-proconnect.vercel.app/

---

## 📊 QUÉ ESPERAR

### Antes de configurar:
```json
{
  "database": {
    "postgres_url_configured": false,
    "type": "In-Memory (Temporal)",
    "status": "⚠️ Modo fallback"
  }
}
```

### Después de configurar:
```json
{
  "database": {
    "postgres_url_configured": true,
    "type": "Neon PostgreSQL",
    "status": "✅ Conectado"
  }
}
```

---

## 🔐 CREDENCIALES DEMO

Una vez configurado, puedes iniciar sesión con:

```
Administrador:
📧 admin@proconnect.com
🔑 admin123

Usuario Demo:
📧 demo@proconnect.com
🔑 demo123
```

---

## ✅ CHECKLIST

- [ ] Variables agregadas en Vercel
- [ ] Redeploy realizado
- [ ] Esperar 1-2 minutos
- [ ] Verificar `/api/health`
- [ ] Verificar `/api/status`
- [ ] Probar login

---

## 🆘 SOLUCIÓN DE PROBLEMAS

### Error: "Cannot find any route"
- Espera 2 minutos más, el deploy puede tardar
- Verifica en Deployments que el estado sea "Ready"

### Error 500 al hacer login
- Verifica que POSTGRES_URL esté configurado
- Verifica que el redeploy haya terminado
- Revisa los logs en Vercel: Deployments → [último] → Runtime Logs

### Base de datos dice "no configurado"
- Verifica que guardaste las variables
- Verifica que seleccionaste Production
- Haz un redeploy nuevo

---

## 📚 MÁS AYUDA

- **GitHub:** https://github.com/corpinfonet-creator/AgenteProconnect
- **Documentación Neon:** https://neon.tech/docs
- **Vercel Docs:** https://vercel.com/docs/environment-variables
