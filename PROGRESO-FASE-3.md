# 🚀 FASE 3 - Integración con Slack

**Fecha de Inicio:** 2026-03-08
**Tiempo Estimado:** 2-3 semanas
**Estado:** 🔄 En Progreso

---

## 🎯 OBJETIVO DE LA FASE 3

Implementar la integración completa con Slack para que cada empresa pueda:
1. Conectar su workspace de Slack mediante OAuth
2. Instalar el bot en su workspace
3. Configurar el agente IA desde el dashboard
4. Comenzar a interactuar con el bot en Slack

---

## 📋 CHECKLIST DE TAREAS

### Parte 1: Configuración de Slack App (1-2 días)
- [ ] Crear Slack App en https://api.slack.com/apps
- [ ] Configurar OAuth Scopes necesarios
- [ ] Configurar Redirect URLs
- [ ] Configurar Event Subscriptions
- [ ] Configurar Bot User
- [ ] Obtener credenciales (Client ID, Client Secret, Signing Secret)

### Parte 2: OAuth Flow (2-3 días)
- [x] Crear endpoint `/api/slack/oauth/start` - Iniciar OAuth
- [x] Crear endpoint `/api/slack/oauth/callback` - Procesar callback
- [x] Almacenar tokens en tabla `slack_connections`
- [x] Validar tokens
- [x] UI botón "Conectar Slack" en dashboard
- [x] Flujo de desconexión
- [x] Endpoint `/api/slack/status` - Estado de conexión
- [x] Endpoint `/api/slack/disconnect` - Desconectar workspace
- [x] Página `/dashboard/slack` - UI completa de configuración
- [ ] Encriptar tokens (pendiente - Fase 8)

### Parte 3: Webhook y Event Handler (2-3 días)
- [ ] Crear endpoint `/api/slack/events` - Recibir eventos
- [ ] Verificar firma de Slack
- [ ] Handler para `message` events
- [ ] Handler para `app_mention` events
- [ ] Handler para `app_home_opened`
- [ ] Sistema de rate limiting

### Parte 4: Bot Básico (3-4 días)
- [ ] Integrar con AI SDK (GPT-4 o Claude)
- [ ] Sistema de prompts personalizables
- [ ] Respuestas básicas del bot
- [ ] Manejo de hilos/threads
- [ ] Contexto de conversación
- [ ] Logging de mensajes

### Parte 5: UI de Configuración (2-3 días)
- [ ] Página `/dashboard/slack` - Config Slack
- [ ] Form para personalizar bot
- [ ] Selector de modelo IA
- [ ] Editor de prompt system
- [ ] Templates por industria
- [ ] Preview de respuestas

### Parte 6: Testing y Docs (1-2 días)
- [ ] Test de OAuth flow
- [ ] Test de eventos
- [ ] Test de respuestas del bot
- [ ] Documentación de setup
- [ ] Guía para usuarios

---

## 🗄️ NUEVAS TABLAS NECESARIAS

### `slack_connections`
```sql
CREATE TABLE slack_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,

  -- OAuth data
  workspace_id VARCHAR(50) NOT NULL,
  workspace_name VARCHAR(255),

  -- Tokens (encriptados)
  access_token TEXT NOT NULL,
  bot_user_id VARCHAR(50),

  -- Metadata
  scope TEXT,
  authed_user_id VARCHAR(50),
  team_id VARCHAR(50),

  -- Estado
  is_active BOOLEAN DEFAULT true,
  last_sync TIMESTAMP,

  -- Timestamps
  connected_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  UNIQUE(tenant_id, workspace_id)
);
```

### `slack_bot_configs`
```sql
CREATE TABLE slack_bot_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,

  -- Configuración del bot
  bot_name VARCHAR(100) DEFAULT 'Asistente',
  bot_emoji VARCHAR(50) DEFAULT ':robot_face:',

  -- AI Config
  ai_model VARCHAR(50) DEFAULT 'gpt-4',
  system_prompt TEXT,
  temperature DECIMAL(3,2) DEFAULT 0.7,
  max_tokens INTEGER DEFAULT 1000,

  -- Comportamiento
  auto_respond BOOLEAN DEFAULT true,
  respond_in_threads BOOLEAN DEFAULT true,
  require_mention BOOLEAN DEFAULT false,

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  UNIQUE(tenant_id)
);
```

### `slack_messages`
```sql
CREATE TABLE slack_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,

  -- Slack data
  channel_id VARCHAR(50) NOT NULL,
  thread_ts VARCHAR(50),
  message_ts VARCHAR(50) NOT NULL,
  user_id VARCHAR(50) NOT NULL,

  -- Contenido
  text TEXT,
  message_type VARCHAR(20), -- 'user', 'bot', 'system'

  -- AI metadata
  prompt_tokens INTEGER,
  completion_tokens INTEGER,
  model_used VARCHAR(50),

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),

  INDEX idx_tenant_channel (tenant_id, channel_id),
  INDEX idx_thread (thread_ts)
);
```

---

## 📝 ENDPOINTS A CREAR

### OAuth
- `GET /api/slack/oauth/start` - Redirige a Slack OAuth
- `GET /api/slack/oauth/callback` - Procesa callback de Slack
- `POST /api/slack/disconnect` - Desconectar workspace

### Events
- `POST /api/slack/events` - Webhook para eventos de Slack

### Configuration
- `GET /api/slack/config` - Obtener config actual
- `PUT /api/slack/config` - Actualizar config
- `GET /api/slack/status` - Estado de conexión

### Testing
- `POST /api/slack/test-message` - Enviar mensaje de prueba

---

## 🎨 NUEVAS PÁGINAS UI

### `/dashboard/slack`
- Estado de conexión con Slack
- Botón para conectar/desconectar
- Configuración del bot
- Preview de respuestas
- Logs recientes

### `/dashboard/slack/setup`
- Wizard de configuración paso a paso
- Templates por industria
- Ejemplos de prompts

---

## 🔑 VARIABLES DE ENTORNO NECESARIAS

```env
# Slack App Credentials
SLACK_CLIENT_ID=your_client_id
SLACK_CLIENT_SECRET=your_client_secret
SLACK_SIGNING_SECRET=your_signing_secret

# OAuth Redirect
SLACK_REDIRECT_URI=https://your-domain.com/api/slack/oauth/callback

# AI
OPENAI_API_KEY=your_openai_key
# O
ANTHROPIC_API_KEY=your_anthropic_key
```

---

## 📚 RECURSOS Y DOCUMENTACIÓN

### Slack API Docs
- [OAuth Guide](https://api.slack.com/authentication/oauth-v2)
- [Events API](https://api.slack.com/events-api)
- [Bot Users](https://api.slack.com/bot-users)
- [Message Formatting](https://api.slack.com/reference/surfaces/formatting)

### Código Existente para Referencia
- `server/lib/ai/workflows/hooks.ts` - Ya tiene integración con @slack/bolt
- `server/routes/api/events.post.ts` - Webhook existente

---

## 🎯 HITOS DE LA FASE 3

### Milestone 1: OAuth Funcional (Días 1-3)
✅ Criterio de éxito: Poder conectar workspace y ver tokens guardados

### Milestone 2: Bot Responde (Días 4-7)
✅ Criterio de éxito: Bot responde "Hello" cuando le mencionan

### Milestone 3: IA Integrada (Días 8-12)
✅ Criterio de éxito: Bot usa GPT/Claude para responder inteligentemente

### Milestone 4: UI Completa (Días 13-15)
✅ Criterio de éxito: Dashboard permite configurar todo sin código

---

## 🚀 PLAN DE IMPLEMENTACIÓN

### Día 1 (HOY):
1. ✅ Crear archivo PROGRESO-FASE-3.md
2. ⏳ Crear Slack App en api.slack.com
3. ⏳ Obtener credenciales
4. ⏳ Crear tablas en BD
5. ⏳ Configurar variables de entorno

### Día 2:
- Implementar OAuth flow completo
- Crear endpoints de OAuth
- Guardar tokens en BD

### Día 3:
- Crear webhook de eventos
- Handler básico de mensajes
- Verificación de firma

### Día 4-5:
- Integrar AI SDK
- Respuestas básicas del bot
- Manejo de contexto

### Día 6-7:
- UI de configuración
- Botón conectar Slack
- Página de settings

### Día 8-10:
- Templates por industria
- Personalización avanzada
- Testing completo

---

## 📊 PROGRESO ACTUAL

**Estado:** OAuth Flow Completado
**Completado:** 60%
**Siguiente Tarea:** Implementar Webhook de Eventos

### ✅ Completado Hoy:
1. ✅ Tablas de BD creadas (4 tablas)
2. ✅ Servicios core implementados
3. ✅ OAuth Flow completo
4. ✅ UI de configuración de Slack
5. ✅ Endpoints de API (4 endpoints)
6. ✅ Guía de setup de Slack App
7. ✅ Variables de entorno configuradas

---

**Última actualización:** 2026-03-08
