# 📋 PLAN DE DESARROLLO - Soft ProConnect Peru SAC
## Sistema SaaS Multi-Empresa con Agente de IA

---

## 🎯 VISIÓN DEL PRODUCTO

**Plataforma SaaS** que permite a empresas de cualquier rubro (inmobiliarias, clínicas, ferreterías, tiendas de ropa, etc.) tener su propio **Agente de IA en Slack** personalizado, gestionado desde un **Dashboard Web**.

---

## 🏗️ ARQUITECTURA GENERAL

### Componentes Principales:

1. **Dashboard Web Multi-Tenant**
   - Login/Registro de empresas
   - Panel de administración
   - Configuración del agente
   - Analytics y reportes
   - Gestión de usuarios

2. **Agente de IA en Slack**
   - Bot personalizable por empresa
   - Herramientas específicas por rubro
   - Integración con AI (GPT-4, Claude, etc.)
   - Workflows durables
   - Human-in-the-Loop

3. **Base de Datos Multi-Tenant**
   - PostgreSQL (Neon)
   - Datos separados por empresa (tenant_id)
   - Configuraciones personalizadas
   - Logs y conversaciones

4. **API Backend**
   - Autenticación y autorización
   - CRUD de empresas y usuarios
   - Webhooks de Slack
   - Endpoints para el agente

---

## 📊 MODELO DE DATOS (Base de Datos)

### Tablas Principales:

```sql
-- Empresas/Organizaciones (Tenants)
tenants {
  id: uuid PRIMARY KEY
  name: string (nombre de la empresa)
  slug: string UNIQUE (subdomain o identificador)
  industry: string (rubro: inmobiliaria, clínica, etc.)
  plan: string (free, basic, premium)
  slack_workspace_id: string
  slack_bot_token: string (encriptado)
  ai_model: string (gpt-4, claude-3, etc.)
  agent_instructions: text (instrucciones personalizadas)
  status: string (active, suspended, cancelled)
  created_at: timestamp
  updated_at: timestamp
}

-- Usuarios (administradores de empresas)
users {
  id: uuid PRIMARY KEY
  tenant_id: uuid REFERENCES tenants
  email: string UNIQUE
  password: string (hashed)
  name: string
  role: string (owner, admin, user)
  avatar: string
  last_login: timestamp
  created_at: timestamp
}

-- Configuración del Agente por Empresa
agent_configs {
  id: uuid PRIMARY KEY
  tenant_id: uuid REFERENCES tenants
  agent_name: string (nombre del bot)
  personality: text (personalidad del agente)
  enabled_tools: jsonb (herramientas habilitadas)
  custom_prompts: jsonb (prompts personalizados)
  response_style: string (formal, casual, técnico)
  language: string (es, en)
  timezone: string
}

-- Conversaciones del Agente
conversations {
  id: uuid PRIMARY KEY
  tenant_id: uuid REFERENCES tenants
  slack_channel_id: string
  slack_thread_ts: string
  user_slack_id: string
  started_at: timestamp
  ended_at: timestamp
  status: string (active, resolved, escalated)
  sentiment: string (positive, neutral, negative)
  tags: jsonb
}

-- Mensajes
messages {
  id: uuid PRIMARY KEY
  conversation_id: uuid REFERENCES conversations
  tenant_id: uuid REFERENCES tenants
  role: string (user, assistant, system)
  content: text
  metadata: jsonb (tool calls, etc.)
  tokens_used: integer
  created_at: timestamp
}

-- Herramientas Personalizadas por Empresa
custom_tools {
  id: uuid PRIMARY KEY
  tenant_id: uuid REFERENCES tenants
  name: string
  description: text
  input_schema: jsonb (Zod schema)
  code: text (función TypeScript)
  enabled: boolean
  created_at: timestamp
}

-- Logs de Actividad
activity_logs {
  id: uuid PRIMARY KEY
  tenant_id: uuid REFERENCES tenants
  user_id: uuid REFERENCES users
  action: string
  resource: string
  details: jsonb
  ip_address: string
  created_at: timestamp
}

-- Planes y Billing
subscriptions {
  id: uuid PRIMARY KEY
  tenant_id: uuid REFERENCES tenants
  plan_name: string
  price: decimal
  billing_period: string (monthly, yearly)
  status: string (active, cancelled, past_due)
  current_period_start: timestamp
  current_period_end: timestamp
  cancel_at: timestamp
}

-- Uso y Métricas
usage_metrics {
  id: uuid PRIMARY KEY
  tenant_id: uuid REFERENCES tenants
  date: date
  messages_sent: integer
  tokens_used: integer
  api_calls: integer
  active_users: integer
}
```

---

## 🚀 FASES DE DESARROLLO

### ✅ FASE 0: FUNDACIÓN (COMPLETADA)
- [x] Configuración inicial del proyecto
- [x] Base de datos PostgreSQL (Neon)
- [x] Sistema de autenticación básico
- [x] Login y registro de usuarios
- [x] Deployment automático en Vercel
- [x] Scripts de desarrollo local

### 🔄 FASE 1: MULTI-TENANCY (ACTUAL - 2 semanas)

#### Semana 1: Base de Datos y Modelos
- [ ] Crear esquema de base de datos multi-tenant
- [ ] Migraciones con Drizzle ORM o Prisma
- [ ] Modelo de datos para tenants, users, configs
- [ ] Sistema de tenant_id en todas las tablas
- [ ] Middleware de tenant isolation

#### Semana 2: Dashboard Multi-Empresa
- [ ] Onboarding de nuevas empresas
- [ ] Selector de empresa (si user tiene múltiples)
- [ ] Settings de empresa (nombre, logo, industria)
- [ ] Gestión de usuarios por empresa
- [ ] Roles y permisos (owner, admin, user)

**Entregable:** Dashboard donde empresas se registran y configuran perfil

---

### 📱 FASE 2: INTEGRACIÓN SLACK (3 semanas)

#### Semana 3: Slack App Setup
- [ ] Configuración de Slack App multi-workspace
- [ ] OAuth flow para conectar workspaces
- [ ] Almacenar tokens por tenant
- [ ] Verificar permisos y scopes
- [ ] UI para conectar/desconectar Slack

#### Semana 4-5: Agente Básico
- [ ] Implementar DurableAgent básico
- [ ] Chat workflow con Workflow DevKit
- [ ] Streaming de respuestas a Slack
- [ ] Manejo de threads
- [ ] Herramientas básicas (buscar canales, leer mensajes)

**Entregable:** Bot funcionando en Slack, respondiendo mensajes

---

### 🤖 FASE 3: PERSONALIZACIÓN DEL AGENTE (3 semanas)

#### Semana 6: Configuración de IA
- [ ] Selector de modelo de IA (GPT-4, Claude, Gemini)
- [ ] Editor de instrucciones del sistema
- [ ] Templates por industria (inmobiliaria, clínica, etc.)
- [ ] Configuración de personalidad y tono
- [ ] Preview del comportamiento

#### Semana 7-8: Herramientas Personalizadas
- [ ] Sistema de herramientas por rubro
- [ ] Herramientas para inmobiliarias (buscar propiedades)
- [ ] Herramientas para clínicas (agendar citas)
- [ ] Herramientas para ferreterías (inventario)
- [ ] Editor de herramientas custom (low-code)

**Entregable:** Agente personalizable según la industria

---

### 🔧 FASE 4: HERRAMIENTAS AVANZADAS (2 semanas)

#### Semana 9-10: Tools & Integrations
- [ ] Integración con calendarios (Google Calendar)
- [ ] Integración con CRM (HubSpot, Salesforce)
- [ ] Integración con bases de datos externas
- [ ] Human-in-the-Loop workflows
- [ ] Aprobaciones y escalaciones
- [ ] Webhooks personalizados

**Entregable:** Agente con integraciones reales

---

### 📊 FASE 5: ANALYTICS Y REPORTES (2 semanas)

#### Semana 11-12: Dashboard de Métricas
- [ ] Dashboard de conversaciones
- [ ] Métricas de uso (mensajes, tokens)
- [ ] Análisis de sentimiento
- [ ] Reportes por periodo
- [ ] Exportación de datos
- [ ] Gráficos y visualizaciones

**Entregable:** Analytics completo para empresas

---

### 💳 FASE 6: BILLING Y MONETIZACIÓN (2 semanas)

#### Semana 13-14: Sistema de Pagos
- [ ] Planes (Free, Basic, Premium, Enterprise)
- [ ] Integración con Stripe
- [ ] Límites por plan (mensajes, usuarios)
- [ ] Billing automático
- [ ] Invoices y recibos
- [ ] Upgrades/downgrades

**Entregable:** Sistema de suscripciones funcionando

---

### 🎨 FASE 7: UX/UI PROFESIONAL (2 semanas)

#### Semana 15-16: Diseño
- [ ] Diseño profesional del dashboard
- [ ] Branding consistente
- [ ] Responsive design
- [ ] Loading states
- [ ] Error handling
- [ ] Onboarding flow mejorado

**Entregable:** Interfaz pulida y profesional

---

### 🔒 FASE 8: SEGURIDAD Y COMPLIANCE (1 semana)

#### Semana 17: Hardening
- [ ] Encriptación de tokens
- [ ] Rate limiting
- [ ] CSRF protection
- [ ] Audit logs
- [ ] GDPR compliance
- [ ] Backups automáticos

**Entregable:** Sistema seguro y compliant

---

### 🚀 FASE 9: OPTIMIZACIÓN Y ESCALA (1 semana)

#### Semana 18: Performance
- [ ] Caching (Redis)
- [ ] Database indexing
- [ ] Query optimization
- [ ] CDN para assets
- [ ] Monitoring (Sentry, LogRocket)
- [ ] Load testing

**Entregable:** Sistema optimizado para escala

---

### 🎯 FASE 10: LANZAMIENTO (1 semana)

#### Semana 19-20: Go to Market
- [ ] Landing page pública
- [ ] Documentación completa
- [ ] Videos tutoriales
- [ ] Pricing page
- [ ] Términos de servicio
- [ ] Marketing inicial

**Entregable:** Producto lanzado al mercado

---

## 🛠️ STACK TECNOLÓGICO

### Frontend
- **Framework:** React + Next.js (o mantener SSR con Nitro)
- **UI:** Tailwind CSS + shadcn/ui
- **Estado:** Zustand o React Query
- **Charts:** Recharts o Chart.js

### Backend
- **Server:** Nitro (actual)
- **ORM:** Drizzle o Prisma
- **Validación:** Zod
- **Auth:** NextAuth o Lucia

### IA & Agentes
- **AI SDK:** Vercel AI SDK (actual)
- **Workflows:** Workflow DevKit (actual)
- **Modelos:** OpenAI, Anthropic, Google AI
- **Vector DB:** Pinecone (para RAG futuro)

### Infraestructura
- **Hosting:** Vercel (actual)
- **Database:** Neon PostgreSQL (actual)
- **Storage:** Vercel Blob o S3
- **Queue:** Inngest o BullMQ
- **Cache:** Vercel KV (Redis)
- **Monitoring:** Sentry + Vercel Analytics

### Integraciones
- **Slack:** Bolt SDK + Slack API
- **Payments:** Stripe
- **Email:** Resend o SendGrid
- **Calendar:** Google Calendar API
- **CRM:** APIs de HubSpot, Salesforce

---

## 💰 MODELO DE NEGOCIO

### Planes Propuestos:

**Free** (Prueba - 14 días)
- 1 workspace de Slack
- 100 mensajes/mes
- 1 agente básico
- Herramientas limitadas

**Basic** ($49/mes)
- 1 workspace
- 1,000 mensajes/mes
- Agente personalizable
- Herramientas básicas
- 5 usuarios

**Premium** ($149/mes)
- 3 workspaces
- 10,000 mensajes/mes
- Agente totalmente personalizado
- Todas las herramientas
- Integraciones avanzadas
- 20 usuarios
- Analytics avanzados

**Enterprise** (Custom)
- Workspaces ilimitados
- Mensajes ilimitados
- Múltiples agentes
- Custom tools
- Soporte dedicado
- SLA garantizado
- On-premise option

---

## 📈 KPIs DE ÉXITO

### Fase de Lanzamiento (3 meses)
- 50 empresas registradas
- 10 empresas pagando
- $500 MRR (Monthly Recurring Revenue)
- 80% retention rate

### Crecimiento (6 meses)
- 200 empresas
- 50 empresas pagando
- $5,000 MRR
- NPS > 8

### Escala (12 meses)
- 1,000 empresas
- 200 empresas pagando
- $20,000 MRR
- Profitabilidad

---

## 🎯 HITOS PRINCIPALES

| Fecha Objetivo | Hito | Descripción |
|----------------|------|-------------|
| Semana 2 | MVP Multi-Tenant | Dashboard básico multi-empresa |
| Semana 5 | Bot Funcionando | Agente respondiendo en Slack |
| Semana 8 | Personalización | Agente configurable por rubro |
| Semana 10 | Integraciones | Conectado con servicios externos |
| Semana 12 | Analytics | Dashboard de métricas completo |
| Semana 14 | Billing | Sistema de pagos activo |
| Semana 16 | Beta Privada | Primeros 10 clientes beta |
| Semana 20 | Lanzamiento | Producto público |

---

## 👥 EQUIPO NECESARIO (Ideal)

- **1 Full-Stack Developer** (tú + mi ayuda)
- **1 AI/ML Engineer** (optimizar agente)
- **1 Designer** (UI/UX)
- **1 Marketing/Sales** (go-to-market)

**O puedes empezar solo y contratar gradualmente.**

---

## 🚀 PRÓXIMO PASO INMEDIATO

### TAREA: Implementar Base de Datos Multi-Tenant

**Tiempo estimado:** 1-2 días

**Tareas concretas:**
1. Diseñar esquema de tablas (tenants, users, agent_configs)
2. Crear migraciones
3. Implementar modelos con ORM
4. Crear middleware de tenant isolation
5. Adaptar login actual para multi-tenant

**¿Empezamos con esto?**

---

## 📚 RECURSOS Y REFERENCIAS

- [Workflow DevKit Docs](https://workflow.vercel.app/)
- [AI SDK Docs](https://sdk.vercel.ai/)
- [Slack API Docs](https://api.slack.com/)
- [Multi-Tenancy Patterns](https://planetscale.com/blog/multi-tenancy-patterns)
- [SaaS Pricing Strategies](https://www.priceintelligently.com/)

---

**Creado:** 2026-03-08
**Última actualización:** 2026-03-08
**Estado:** Fase 0 Completada → Iniciando Fase 1
