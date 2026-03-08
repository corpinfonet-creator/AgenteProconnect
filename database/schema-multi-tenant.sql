-- ================================================
-- ESQUEMA DE BASE DE DATOS MULTI-TENANT
-- Soft ProConnect Peru SAC
-- ================================================

-- Extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- Para búsquedas full-text

-- ================================================
-- TABLA: tenants (Empresas/Organizaciones)
-- ================================================
CREATE TABLE tenants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL, -- identificador único (ej: "inmobiliaria-abc")
    industry VARCHAR(100), -- inmobiliaria, clinica, ferreteria, tienda_ropa, etc.
    plan VARCHAR(50) DEFAULT 'free', -- free, basic, premium, enterprise

    -- Slack Configuration
    slack_workspace_id VARCHAR(255),
    slack_bot_token TEXT, -- Encriptado
    slack_app_id VARCHAR(255),
    slack_team_name VARCHAR(255),

    -- AI Configuration
    ai_provider VARCHAR(50) DEFAULT 'openai', -- openai, anthropic, google
    ai_model VARCHAR(100) DEFAULT 'gpt-4', -- gpt-4, claude-3-opus, gemini-pro
    ai_api_key TEXT, -- Encriptado (o usar una key maestra)

    -- Agent Configuration
    agent_name VARCHAR(100) DEFAULT 'Assistant',
    agent_instructions TEXT, -- System prompt personalizado
    agent_personality VARCHAR(50) DEFAULT 'professional', -- professional, friendly, technical

    -- Status & Metadata
    status VARCHAR(50) DEFAULT 'active', -- active, suspended, cancelled, trial
    trial_ends_at TIMESTAMP,
    logo_url TEXT,
    website VARCHAR(500),
    contact_email VARCHAR(255),
    contact_phone VARCHAR(50),

    -- Billing
    stripe_customer_id VARCHAR(255),
    stripe_subscription_id VARCHAR(255),

    -- Limits
    max_users INTEGER DEFAULT 5,
    max_messages_per_month INTEGER DEFAULT 100,

    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP -- Soft delete
);

-- Índices para tenants
CREATE INDEX idx_tenants_slug ON tenants(slug);
CREATE INDEX idx_tenants_status ON tenants(status);
CREATE INDEX idx_tenants_plan ON tenants(plan);

-- ================================================
-- TABLA: users (Usuarios del sistema)
-- ================================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

    -- Authentication
    email VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL, -- bcrypt hash
    email_verified BOOLEAN DEFAULT FALSE,
    email_verification_token VARCHAR(255),
    password_reset_token VARCHAR(255),
    password_reset_expires TIMESTAMP,

    -- Profile
    name VARCHAR(255) NOT NULL,
    avatar VARCHAR(500),
    role VARCHAR(50) DEFAULT 'user', -- owner, admin, user, viewer
    phone VARCHAR(50),

    -- Slack Integration
    slack_user_id VARCHAR(255),
    slack_username VARCHAR(255),

    -- Activity
    last_login TIMESTAMP,
    last_active TIMESTAMP,
    login_count INTEGER DEFAULT 0,

    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Constraints
    UNIQUE(tenant_id, email) -- Email único por tenant
);

-- Índices para users
CREATE INDEX idx_users_tenant_id ON users(tenant_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- ================================================
-- TABLA: agent_configs (Configuración del agente)
-- ================================================
CREATE TABLE agent_configs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

    -- Agent Behavior
    response_style VARCHAR(50) DEFAULT 'helpful', -- helpful, concise, detailed
    language VARCHAR(10) DEFAULT 'es', -- es, en, pt
    timezone VARCHAR(100) DEFAULT 'America/Lima',

    -- Enabled Features
    enabled_tools JSONB DEFAULT '[]', -- ['search_channels', 'join_channel', 'get_messages']
    custom_prompts JSONB DEFAULT '{}', -- { "greeting": "Hola, ¿en qué puedo ayudarte?" }
    quick_replies JSONB DEFAULT '[]', -- Respuestas rápidas predefinidas

    -- Moderation
    profanity_filter BOOLEAN DEFAULT FALSE,
    blocked_words JSONB DEFAULT '[]',
    auto_escalation_keywords JSONB DEFAULT '[]', -- Palabras que escalan a humano

    -- Business Hours
    business_hours JSONB, -- { "monday": { "start": "09:00", "end": "18:00" }, ... }
    out_of_hours_message TEXT,

    -- Limits
    max_message_length INTEGER DEFAULT 2000,
    rate_limit_per_user INTEGER DEFAULT 10, -- mensajes por minuto

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Constraints
    UNIQUE(tenant_id) -- Un config por tenant
);

-- ================================================
-- TABLA: conversations (Conversaciones)
-- ================================================
CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

    -- Slack Context
    slack_channel_id VARCHAR(255) NOT NULL,
    slack_thread_ts VARCHAR(255),
    slack_user_id VARCHAR(255) NOT NULL,

    -- Conversation Metadata
    title TEXT, -- Resumen auto-generado
    status VARCHAR(50) DEFAULT 'active', -- active, resolved, escalated, archived
    priority VARCHAR(50) DEFAULT 'normal', -- low, normal, high, urgent
    sentiment VARCHAR(50), -- positive, neutral, negative (AI-detected)

    -- Tags & Categorization
    tags JSONB DEFAULT '[]', -- ['soporte', 'ventas', 'consulta']
    category VARCHAR(100), -- Auto-detectado por IA

    -- Assignment
    assigned_to UUID REFERENCES users(id), -- Usuario asignado (si escalado)
    escalated_at TIMESTAMP,
    resolved_at TIMESTAMP,

    -- Stats
    message_count INTEGER DEFAULT 0,
    user_message_count INTEGER DEFAULT 0,
    agent_message_count INTEGER DEFAULT 0,
    avg_response_time INTEGER, -- segundos

    -- Timestamps
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_message_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ended_at TIMESTAMP
);

-- Índices para conversations
CREATE INDEX idx_conversations_tenant_id ON conversations(tenant_id);
CREATE INDEX idx_conversations_status ON conversations(status);
CREATE INDEX idx_conversations_slack_channel ON conversations(slack_channel_id);
CREATE INDEX idx_conversations_started_at ON conversations(started_at DESC);
CREATE INDEX idx_conversations_assigned_to ON conversations(assigned_to);

-- ================================================
-- TABLA: messages (Mensajes)
-- ================================================
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

    -- Message Data
    role VARCHAR(50) NOT NULL, -- user, assistant, system, tool
    content TEXT NOT NULL,

    -- Slack Context
    slack_message_ts VARCHAR(255),
    slack_user_id VARCHAR(255),

    -- AI Metadata
    model VARCHAR(100), -- Modelo usado para generar
    tokens_used INTEGER DEFAULT 0,
    prompt_tokens INTEGER DEFAULT 0,
    completion_tokens INTEGER DEFAULT 0,
    finish_reason VARCHAR(50), -- stop, length, tool_calls

    -- Tool Calls
    tool_calls JSONB, -- Array de tool calls realizados
    tool_results JSONB, -- Resultados de las herramientas

    -- Additional Metadata
    metadata JSONB, -- Cualquier metadata adicional
    error TEXT, -- Si hubo error

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para messages
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_tenant_id ON messages(tenant_id);
CREATE INDEX idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX idx_messages_role ON messages(role);

-- ================================================
-- TABLA: custom_tools (Herramientas Personalizadas)
-- ================================================
CREATE TABLE custom_tools (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

    -- Tool Definition
    name VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    input_schema JSONB NOT NULL, -- Zod schema en JSON

    -- Implementation
    code TEXT, -- Código TypeScript de la herramienta
    handler_url TEXT, -- O URL a un webhook externo

    -- Configuration
    enabled BOOLEAN DEFAULT TRUE,
    require_approval BOOLEAN DEFAULT FALSE, -- Human-in-the-loop
    timeout_seconds INTEGER DEFAULT 30,

    -- Stats
    usage_count INTEGER DEFAULT 0,
    last_used_at TIMESTAMP,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(tenant_id, name)
);

-- ================================================
-- TABLA: activity_logs (Logs de Actividad)
-- ================================================
CREATE TABLE activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,

    -- Activity Details
    action VARCHAR(100) NOT NULL, -- created, updated, deleted, etc.
    resource VARCHAR(100) NOT NULL, -- user, conversation, config, etc.
    resource_id UUID,

    -- Context
    details JSONB, -- Detalles adicionales
    ip_address VARCHAR(45),
    user_agent TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para activity_logs
CREATE INDEX idx_activity_logs_tenant_id ON activity_logs(tenant_id);
CREATE INDEX idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX idx_activity_logs_created_at ON activity_logs(created_at DESC);
CREATE INDEX idx_activity_logs_action ON activity_logs(action);

-- ================================================
-- TABLA: subscriptions (Suscripciones)
-- ================================================
CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

    -- Plan Details
    plan_name VARCHAR(50) NOT NULL, -- free, basic, premium, enterprise
    price DECIMAL(10, 2),
    billing_period VARCHAR(20), -- monthly, yearly
    currency VARCHAR(3) DEFAULT 'USD',

    -- Stripe
    stripe_subscription_id VARCHAR(255),
    stripe_price_id VARCHAR(255),

    -- Status
    status VARCHAR(50) DEFAULT 'active', -- active, cancelled, past_due, trialing
    trial_start TIMESTAMP,
    trial_end TIMESTAMP,
    current_period_start TIMESTAMP,
    current_period_end TIMESTAMP,
    cancel_at TIMESTAMP,
    cancelled_at TIMESTAMP,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ================================================
-- TABLA: usage_metrics (Métricas de Uso)
-- ================================================
CREATE TABLE usage_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

    -- Period
    date DATE NOT NULL,

    -- Usage Stats
    messages_sent INTEGER DEFAULT 0,
    messages_received INTEGER DEFAULT 0,
    tokens_used INTEGER DEFAULT 0,
    conversations_started INTEGER DEFAULT 0,
    conversations_resolved INTEGER DEFAULT 0,

    -- API Stats
    api_calls INTEGER DEFAULT 0,
    tool_calls INTEGER DEFAULT 0,

    -- User Stats
    active_users INTEGER DEFAULT 0,
    new_users INTEGER DEFAULT 0,

    -- Response Times
    avg_response_time INTEGER, -- ms
    median_response_time INTEGER,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(tenant_id, date)
);

-- Índices para usage_metrics
CREATE INDEX idx_usage_metrics_tenant_id ON usage_metrics(tenant_id);
CREATE INDEX idx_usage_metrics_date ON usage_metrics(date DESC);

-- ================================================
-- TABLA: integrations (Integraciones Externas)
-- ================================================
CREATE TABLE integrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

    -- Integration Type
    provider VARCHAR(100) NOT NULL, -- google_calendar, hubspot, salesforce, etc.
    name VARCHAR(255) NOT NULL,

    -- Credentials (encriptadas)
    access_token TEXT,
    refresh_token TEXT,
    token_expires_at TIMESTAMP,

    -- Config
    config JSONB, -- Configuración específica del proveedor
    enabled BOOLEAN DEFAULT TRUE,

    -- Stats
    last_sync_at TIMESTAMP,
    sync_status VARCHAR(50), -- success, error, pending
    sync_error TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(tenant_id, provider)
);

-- ================================================
-- TABLA: webhooks (Webhooks Configurables)
-- ================================================
CREATE TABLE webhooks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

    -- Webhook Config
    name VARCHAR(255) NOT NULL,
    url TEXT NOT NULL,
    events JSONB NOT NULL, -- ['conversation.created', 'message.sent']

    -- Security
    secret VARCHAR(255), -- Para firmar requests
    headers JSONB, -- Headers adicionales

    -- Status
    enabled BOOLEAN DEFAULT TRUE,

    -- Stats
    last_triggered_at TIMESTAMP,
    success_count INTEGER DEFAULT 0,
    failure_count INTEGER DEFAULT 0,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ================================================
-- VISTAS ÚTILES
-- ================================================

-- Vista de estadísticas por tenant
CREATE VIEW tenant_stats AS
SELECT
    t.id,
    t.name,
    t.plan,
    t.status,
    COUNT(DISTINCT u.id) as total_users,
    COUNT(DISTINCT c.id) as total_conversations,
    COUNT(DISTINCT m.id) as total_messages,
    COALESCE(SUM(um.tokens_used), 0) as total_tokens_used,
    t.created_at
FROM tenants t
LEFT JOIN users u ON u.tenant_id = t.id AND u.deleted_at IS NULL
LEFT JOIN conversations c ON c.tenant_id = t.id
LEFT JOIN messages m ON m.tenant_id = t.id
LEFT JOIN usage_metrics um ON um.tenant_id = t.id
WHERE t.deleted_at IS NULL
GROUP BY t.id;

-- ================================================
-- FUNCIONES AUXILIARES
-- ================================================

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at
CREATE TRIGGER update_tenants_updated_at BEFORE UPDATE ON tenants
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_agent_configs_updated_at BEFORE UPDATE ON agent_configs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ================================================
-- POLÍTICAS DE SEGURIDAD (Row Level Security)
-- ================================================

-- Habilitar RLS
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Políticas básicas (se refinan según el contexto de auth)
-- Usuarios solo pueden ver datos de su tenant

-- ================================================
-- DATOS INICIALES
-- ================================================

-- Tenant de demo
INSERT INTO tenants (name, slug, industry, plan, status)
VALUES
('Soft ProConnect Peru SAC', 'soft-proconnect', 'technology', 'enterprise', 'active'),
('Demo Inmobiliaria ABC', 'demo-inmobiliaria', 'inmobiliaria', 'free', 'trial'),
('Clínica Salud Plus', 'demo-clinica', 'clinica', 'basic', 'active');

-- Usuario admin para cada tenant (passwords: admin123)
-- Hash bcrypt de "admin123": $2a$10$rH8L5qGNQV5y5TqBx/FQ0eKvXxJ5vH5mH5YqH5YqH5YqH5YqH5Yq

-- ================================================
-- FIN DEL ESQUEMA
-- ================================================
