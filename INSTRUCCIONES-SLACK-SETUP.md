# ✅ INSTRUCCIONES: Crear y Configurar Slack App

**IMPORTANTE:** Este proceso toma aproximadamente 5-10 minutos.

---

## 🌐 PASO 1: Crear la Slack App

La página debería haberse abierto en tu navegador:
👉 https://api.slack.com/apps

### Acciones:

1. ✅ Click en el botón verde **"Create New App"**
2. ✅ Selecciona **"From scratch"**
3. ✅ Completa el formulario:
   - **App Name:** `Asistente IA ProConnect`
   - **Pick a workspace:** Selecciona tu workspace de Slack
4. ✅ Click en **"Create App"**

---

## 🔐 PASO 2: Configurar OAuth & Permissions

### 2.1 - Redirect URLs

1. ✅ En el menú lateral izquierdo, click en **"OAuth & Permissions"**
2. ✅ Scroll hasta la sección **"Redirect URLs"**
3. ✅ Click en **"Add New Redirect URL"**
4. ✅ Pega esta URL exactamente:
   ```
   http://localhost:3002/api/slack/oauth/callback
   ```
5. ✅ Click en **"Add"**
6. ✅ Click en **"Save URLs"** (abajo)

### 2.2 - Bot Token Scopes

7. ✅ Scroll hasta **"Scopes"** → **"Bot Token Scopes"**
8. ✅ Click **"Add an OAuth Scope"** para CADA uno de estos (15 scopes):

   ```
   ☐ chat:write
   ☐ chat:write.public
   ☐ channels:history
   ☐ channels:read
   ☐ groups:history
   ☐ groups:read
   ☐ im:history
   ☐ im:read
   ☐ im:write
   ☐ mpim:history
   ☐ mpim:read
   ☐ mpim:write
   ☐ app_mentions:read
   ☐ users:read
   ☐ team:read
   ```

### 2.3 - User Token Scopes

9. ✅ En la sección **"User Token Scopes"**, agregar:
   ```
   ☐ identity.basic
   ☐ identity.email
   ```

**Total:** 17 scopes (15 bot + 2 user)

---

## 🔑 PASO 3: Obtener Credenciales

1. ✅ En el menú lateral, click en **"Basic Information"**
2. ✅ Scroll hasta **"App Credentials"**
3. ✅ Vas a ver 3 credenciales:

### 📋 Client ID
- ✅ **Copiar el Client ID** (formato: `1234567890.1234567890`)
- ✅ Guardarlo temporalmente

### 🔐 Client Secret
- ✅ Click en **"Show"** para revelarlo
- ✅ **Copiar el Client Secret** (cadena larga de caracteres)
- ✅ Guardarlo temporalmente

### 🔒 Signing Secret
- ✅ Click en **"Show"** para revelarlo
- ✅ **Copiar el Signing Secret** (cadena larga de caracteres)
- ✅ Guardarlo temporalmente

---

## 💾 PASO 4: Actualizar Archivo .env

### Opción A: Manual (Recomendado)

1. ✅ Abrir el archivo `.env` en tu editor
2. ✅ Buscar estas líneas:
   ```env
   SLACK_CLIENT_ID=your_slack_client_id_here
   SLACK_CLIENT_SECRET=your_slack_client_secret_here
   SLACK_SIGNING_SECRET=your-slack-signing-secret-here
   ```
3. ✅ Reemplazar con tus credenciales:
   ```env
   SLACK_CLIENT_ID=1234567890.1234567890
   SLACK_CLIENT_SECRET=abc123def456ghi789jkl012mno345pqr678
   SLACK_SIGNING_SECRET=xyz789abc123def456ghi789jkl012mno3
   ```
4. ✅ Guardar el archivo

### Opción B: Script Automático

Ejecuta este comando y pega tus credenciales cuando te lo pida:
```bash
npm run slack:setup
```

---

## 🧪 PASO 5: Probar la Conexión

1. ✅ **Reiniciar el servidor** (si está corriendo):
   ```bash
   # Presiona Ctrl+C para detener
   npm run dev
   ```

2. ✅ Abrir el dashboard:
   ```
   http://localhost:3002/dashboard
   ```

3. ✅ Click en **"🔗 Conectar Slack"**
   - O ir directo a: `http://localhost:3002/dashboard/slack`

4. ✅ Click en el botón **"Conectar con Slack"**

5. ✅ **Autorizar la app** en la ventana de Slack que se abre:
   - Revisa los permisos
   - Click en **"Allow"** (Permitir)

6. ✅ **Verificar conexión exitosa:**
   - Deberías ver: "✅ Workspace conectado exitosamente!"
   - Estado: "✅ Conectado"
   - Información de tu workspace

---

## ✅ CHECKLIST FINAL

- [ ] Slack App creada
- [ ] 15 Bot Token Scopes agregados
- [ ] 2 User Token Scopes agregados
- [ ] Redirect URL configurada
- [ ] Client ID copiado
- [ ] Client Secret copiado
- [ ] Signing Secret copiado
- [ ] Archivo .env actualizado
- [ ] Servidor reiniciado
- [ ] Dashboard abierto
- [ ] Click en "Conectar con Slack"
- [ ] App autorizada en Slack
- [ ] Estado "Conectado" visible ✅

---

## 🆘 SOLUCIÓN DE PROBLEMAS

### ❌ Error: "redirect_uri_mismatch"
**Causa:** La URL de redirect no coincide.

**Solución:**
1. Verifica que en Slack App → OAuth & Permissions → Redirect URLs esté:
   ```
   http://localhost:3002/api/slack/oauth/callback
   ```
2. Verifica que en `.env` esté:
   ```
   SLACK_REDIRECT_URI=http://localhost:3002/api/slack/oauth/callback
   ```
3. Deben ser EXACTAMENTE iguales (incluyendo http://, no https://)

### ❌ Error: "slack_not_configured"
**Causa:** Las variables de entorno no están cargadas.

**Solución:**
1. Verifica que `.env` tenga las 3 credenciales
2. Reinicia el servidor
3. Verifica que no haya espacios extra en las credenciales

### ❌ Error: "invalid_client_id"
**Causa:** Client ID incorrecto.

**Solución:**
1. Copia de nuevo el Client ID desde Slack App → Basic Information
2. Asegúrate de copiar todo (formato: `1234567890.1234567890`)
3. Actualiza `.env` y reinicia servidor

### ❌ No aparece el botón "Conectar con Slack"
**Causa:** JavaScript no está cargando.

**Solución:**
1. Abre la consola del navegador (F12)
2. Busca errores en rojo
3. Verifica que el servidor esté corriendo en puerto 3002

---

## 📞 SIGUIENTE PASO

Una vez conectado exitosamente, podrás:

1. ✅ Ver tu workspace conectado en el dashboard
2. ✅ Configurar el comportamiento del bot
3. ✅ Personalizar prompts de IA
4. ✅ Seleccionar modelo (GPT-4 o Claude)
5. ✅ Comenzar a recibir mensajes en Slack

---

## 🎉 ¿LISTO?

Cuando tengas todas las credenciales copiadas:

```bash
# Asegúrate de que el servidor NO esté corriendo
# Si está corriendo, presiona Ctrl+C

# Luego ejecuta:
npm run dev
```

Luego ve a: http://localhost:3002/dashboard/slack

---

**Tiempo estimado:** 5-10 minutos
**Dificultad:** Fácil
**Resultado:** Workspace de Slack conectado ✅

---

¿Necesitas ayuda? Revisa `GUIA-SLACK-APP-SETUP.md` para más detalles.
