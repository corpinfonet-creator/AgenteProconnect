# 📘 Guía de Configuración de Slack App

Esta guía te ayudará a crear y configurar tu Slack App para que puedas conectar workspaces a tu plataforma.

---

## 🎯 Paso 1: Crear la Slack App

1. **Ve a Slack API**
   - Abre: https://api.slack.com/apps
   - Click en **"Create New App"**

2. **Selecciona "From scratch"**
   - App Name: `Asistente IA - [Tu Empresa]`
   - Workspace: Selecciona tu workspace de desarrollo
   - Click **"Create App"**

---

## ⚙️ Paso 2: Configurar OAuth & Permissions

1. **En el menú lateral, ve a "OAuth & Permissions"**

2. **Scroll hasta "Scopes"**

3. **Agregar Bot Token Scopes** (Click "Add an OAuth Scope"):
   ```
   ✅ chat:write
   ✅ chat:write.public
   ✅ channels:history
   ✅ channels:read
   ✅ groups:history
   ✅ groups:read
   ✅ im:history
   ✅ im:read
   ✅ im:write
   ✅ mpim:history
   ✅ mpim:read
   ✅ mpim:write
   ✅ app_mentions:read
   ✅ users:read
   ✅ team:read
   ```

4. **Agregar User Token Scopes** (opcional):
   ```
   ✅ identity.basic
   ✅ identity.email
   ```

5. **Scroll hasta "Redirect URLs"**
   - Click **"Add New Redirect URL"**
   - Para desarrollo local:
     ```
     http://localhost:3002/api/slack/oauth/callback
     ```
   - Para producción (agregar cuando despliegues):
     ```
     https://tu-dominio.vercel.app/api/slack/oauth/callback
     ```
   - Click **"Save URLs"**

---

## 🔔 Paso 3: Configurar Event Subscriptions

1. **En el menú lateral, ve a "Event Subscriptions"**

2. **Enable Events: ON**

3. **Request URL** (esto lo configuraremos después):
   ```
   http://localhost:3002/api/slack/events
   ```
   ⚠️ **NOTA:** Para desarrollo local necesitarás usar **ngrok** o **tunnel**. Por ahora puedes dejar esto pendiente.

4. **Subscribe to bot events**:
   - Click **"Add Bot User Event"**
   - Agregar:
     ```
     ✅ message.channels
     ✅ message.groups
     ✅ message.im
     ✅ message.mpim
     ✅ app_mention
     ```

5. **Click "Save Changes"** (abajo de la página)

---

## 🤖 Paso 4: Configurar App Home

1. **En el menú lateral, ve a "App Home"**

2. **En la sección "Show Tabs"**:
   - ✅ Home Tab: ON
   - ✅ Messages Tab: ON

3. **Display Information**:
   - App Display Name: `Asistente IA`
   - Default Name: `asistente`

---

## 🔑 Paso 5: Obtener Credenciales

1. **Ve a "Basic Information"** en el menú lateral

2. **Scroll hasta "App Credentials"**

3. **Copiar estos valores**:
   - **Client ID**: `1234567890.1234567890`
   - **Client Secret**: Click "Show" y copiar
   - **Signing Secret**: Click "Show" y copiar

---

## 📝 Paso 6: Configurar Variables de Entorno

1. **Abre el archivo `.env` en tu proyecto**

2. **Reemplaza los valores con tus credenciales**:
   ```env
   SLACK_CLIENT_ID=1234567890.1234567890
   SLACK_CLIENT_SECRET=abc123def456ghi789
   SLACK_SIGNING_SECRET=xyz789abc123def456
   SLACK_REDIRECT_URI=http://localhost:3002/api/slack/oauth/callback
   ```

3. **Guarda el archivo**

---

## 🚀 Paso 7: Probar la Instalación

1. **Reinicia tu servidor local**:
   ```bash
   npm run dev
   ```

2. **Ve a tu dashboard**:
   ```
   http://localhost:3002/dashboard
   ```

3. **Navega a "Configuración de Slack"** (o ve directo a):
   ```
   http://localhost:3002/dashboard/slack
   ```

4. **Click en "Conectar con Slack"**

5. **Autoriza la app en Slack**

6. **¡Listo!** Deberías ver el estado "Conectado" ✅

---

## 🔧 Configuración Avanzada (Opcional)

### Para usar en Producción

1. **En Slack App, ve a "OAuth & Permissions"**
   - Agregar Redirect URL de producción:
     ```
     https://tu-dominio.vercel.app/api/slack/oauth/callback
     ```

2. **Actualizar variables de entorno en Vercel**:
   - Ve a: https://vercel.com/dashboard
   - Selecciona tu proyecto
   - Settings → Environment Variables
   - Agregar las mismas variables del `.env`

### Para Event Subscriptions (Webhook)

**Necesitarás un URL público.** Opciones:

**Opción A: ngrok (Desarrollo)**
```bash
# Instalar ngrok
npm install -g ngrok

# Iniciar tunnel
ngrok http 3002

# Copiar la URL https (ej: https://abc123.ngrok.io)
# Usarla en Event Subscriptions:
# https://abc123.ngrok.io/api/slack/events
```

**Opción B: Vercel (Producción)**
```
https://tu-dominio.vercel.app/api/slack/events
```

---

## ✅ Checklist de Configuración

- [ ] Slack App creada
- [ ] OAuth Scopes configurados (15 bot scopes)
- [ ] Redirect URLs agregadas
- [ ] Event Subscriptions configurados (5 eventos)
- [ ] App Home configurado
- [ ] Credenciales copiadas
- [ ] Variables de entorno actualizadas en `.env`
- [ ] Servidor reiniciado
- [ ] Workspace conectado desde dashboard
- [ ] Estado "Conectado" visible ✅

---

## 🆘 Solución de Problemas

### Error: "redirect_uri_mismatch"
- Verifica que la URL en `.env` coincida exactamente con la configurada en Slack
- Asegúrate de incluir el protocolo (`http://` o `https://`)
- Verifica que no haya espacios al inicio o final

### Error: "invalid_code"
- El código OAuth expira rápidamente
- Intenta el proceso de OAuth nuevamente

### Error: "slack_not_configured"
- Verifica que todas las variables estén en `.env`
- Reinicia el servidor después de cambiar `.env`

### No aparece el botón de conectar
- Verifica que el servidor esté corriendo
- Abre la consola del navegador (F12) y busca errores
- Verifica que `/api/slack/status` responda correctamente

### El webhook no funciona
- Para desarrollo local, usa ngrok
- Verifica que la URL termine en `/api/slack/events`
- Slack intentará verificar el endpoint, debe responder al challenge

---

## 📚 Recursos Adicionales

- [Slack OAuth Documentation](https://api.slack.com/authentication/oauth-v2)
- [Slack Events API](https://api.slack.com/events-api)
- [Slack Bot Users](https://api.slack.com/bot-users)
- [Slack Scopes Reference](https://api.slack.com/scopes)

---

## 🎉 ¡Siguiente Paso!

Una vez que tengas Slack conectado, podrás:

1. Configurar el bot desde el dashboard
2. Personalizar la personalidad del bot
3. Seleccionar el modelo de IA
4. Definir canales permitidos
5. ¡Empezar a chatear con tu bot!

Ve a: `http://localhost:3002/dashboard/slack/config` (próximamente)

---

**Fecha:** 2026-03-08
**Versión:** 1.0
**Última actualización:** Fase 3 - OAuth Flow
