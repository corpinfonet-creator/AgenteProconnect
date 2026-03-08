# 🔍 DÓNDE ENCONTRAR LAS CREDENCIALES DE SLACK

## 📍 Ubicación en Slack App

```
https://api.slack.com/apps
└── [Tu App] (ej: "Asistente IA ProConnect")
    └── Basic Information (menú lateral izquierdo)
        └── Scroll hasta "App Credentials"
```

---

## 🔑 LAS 3 CREDENCIALES QUE NECESITAS

### 1️⃣ Client ID

**Dónde está:**
```
Basic Information → App Credentials → Client ID
```

**Cómo se ve:**
```
1234567890.1234567890
```

**Características:**
- ✅ Siempre visible (no necesitas hacer click en "Show")
- ✅ Tiene un punto (.) en el medio
- ✅ Son números separados por punto
- ✅ Ejemplo: `8123456789.2987654321`

**Copiar:**
- Selecciona todo el número
- Copia (Ctrl+C)

---

### 2️⃣ Client Secret

**Dónde está:**
```
Basic Information → App Credentials → Client Secret
```

**Cómo obtenerlo:**
1. Busca la línea que dice "Client Secret"
2. Hay un botón que dice **"Show"** a la derecha
3. ⚠️ **IMPORTANTE:** Click en "Show" primero
4. Se revelará una cadena larga de caracteres

**Cómo se ve:**
```
abc123def456ghi789jkl012mno345pqr678stu901vwx234
```

**Características:**
- ✅ Es una cadena larga (40-50 caracteres)
- ✅ Mezcla de letras y números
- ✅ Está OCULTA por defecto (necesitas hacer click en "Show")
- ✅ Ejemplo: `4d8f9a2b1c3e5d7f9g1h3j5k7m9n1p3r5t7v9x1z`

**Copiar:**
- Click en "Show"
- Selecciona toda la cadena
- Copia (Ctrl+C)

---

### 3️⃣ Signing Secret

**Dónde está:**
```
Basic Information → App Credentials → Signing Secret
```

**Cómo obtenerlo:**
1. Busca la línea que dice "Signing Secret"
2. Hay un botón que dice **"Show"** a la derecha
3. ⚠️ **IMPORTANTE:** Click en "Show" primero
4. Se revelará una cadena larga de caracteres

**Cómo se ve:**
```
xyz789abc123def456ghi789jkl012mno345pqr678stu9
```

**Características:**
- ✅ Es una cadena larga (40-50 caracteres)
- ✅ Mezcla de letras y números
- ✅ Está OCULTA por defecto (necesitas hacer click en "Show")
- ✅ MUY parecido al Client Secret
- ✅ Ejemplo: `7a8b9c0d1e2f3g4h5i6j7k8l9m0n1o2p3q4r5s6t7u`

**Copiar:**
- Click en "Show"
- Selecciona toda la cadena
- Copia (Ctrl+C)

---

## 📸 REFERENCIA VISUAL

```
┌────────────────────────────────────────────────────────────┐
│ Basic Information                                          │
└────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────┐
│ App Credentials                                            │
│                                                            │
│ Client ID                                                  │
│ 1234567890.1234567890                                      │
│                                                            │
│ Client Secret                          [Show] [Regenerate] │
│ ••••••••••••••••••••••••••••••••                          │
│ ⬆️ CLICK EN "Show" AQUÍ                                    │
│                                                            │
│ Signing Secret                         [Show] [Regenerate] │
│ ••••••••••••••••••••••••••••••••                          │
│ ⬆️ CLICK EN "Show" AQUÍ                                    │
│                                                            │
│ Verification Token (deprecated)                            │
│ ••••••••••••••••••••••••••••••••                          │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

---

## ✅ CHECKLIST DE COPIADO

Marca cada uno cuando lo hayas copiado:

- [ ] **Client ID copiado**
  - Debe tener un punto en el medio
  - Solo números
  - Ejemplo: `1234567890.1234567890`

- [ ] **Client Secret copiado**
  - Hiciste click en "Show" ✓
  - Es una cadena larga
  - Mezcla letras y números
  - Guardado en algún lugar seguro

- [ ] **Signing Secret copiado**
  - Hiciste click en "Show" ✓
  - Es una cadena larga
  - Mezcla letras y números
  - Guardado en algún lugar seguro

---

## 💾 PRÓXIMO PASO: Actualizar .env

### Opción A: Manualmente

1. Abre el archivo `.env` en tu editor
2. Busca estas líneas:
   ```env
   SLACK_CLIENT_ID=your_slack_client_id_here
   SLACK_CLIENT_SECRET=your_slack_client_secret_here
   SLACK_SIGNING_SECRET=your-slack-signing-secret-here
   ```
3. Reemplaza con tus credenciales:
   ```env
   SLACK_CLIENT_ID=1234567890.1234567890
   SLACK_CLIENT_SECRET=abc123def456ghi789...
   SLACK_SIGNING_SECRET=xyz789abc123def456...
   ```
4. Guarda el archivo

### Opción B: Con Script

Ejecuta este comando y pega las credenciales:
```bash
npm run slack:credentials
```

---

## ⚠️ IMPORTANTE

### ❌ NO confundir con:

- **Verification Token** (deprecated) - ❌ NO uses este
- **App ID** - ❌ NO es lo mismo que Client ID
- **Bot Token** - ❌ Esto se genera DESPUÉS de instalar la app

### ✅ SOLO necesitas estos 3:

1. ✅ **Client ID** - Visible siempre
2. ✅ **Client Secret** - Click "Show" primero
3. ✅ **Signing Secret** - Click "Show" primero

---

## 🆘 PROBLEMAS COMUNES

### "No veo el botón Show"

**Solución:** Asegúrate de estar en:
```
Slack API → [Tu App] → Basic Information → App Credentials
```

### "Copié pero no funciona"

**Verifica:**
- ✅ No copiaste espacios extra al inicio o final
- ✅ Copiaste TODO el texto
- ✅ No incluiste las comillas en el .env
- ✅ Guardaste el archivo .env después de pegar

### "Dice que Client Secret es muy corto"

**Solución:**
- Asegúrate de hacer click en "Show" primero
- Copia la cadena COMPLETA que aparece
- Debe tener al menos 30 caracteres

---

## 🎯 RESUMEN RÁPIDO

```bash
# 1. Ve a Slack API
https://api.slack.com/apps

# 2. Selecciona tu app

# 3. Basic Information → App Credentials

# 4. Copia:
   - Client ID (visible)
   - Client Secret (click "Show")
   - Signing Secret (click "Show")

# 5. Actualiza .env con esas 3 credenciales

# 6. ¡Listo!
```

---

**Tiempo estimado:** 2 minutos
**Dificultad:** Muy fácil
**Resultado:** Credenciales listas para usar ✅
