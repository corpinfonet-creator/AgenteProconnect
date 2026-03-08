-- ============================================
-- FASE 3: Integración con Slack
-- Tablas para gestionar conexiones y mensajes
-- ============================================

-- 1. Conexiones de Slack por Tenant
CREATE TABLE IF NOT EXISTS slack_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

  -- OAuth data
  workspace_id VARCHAR(50) NOT NULL,
  workspace_name VARCHAR(255),

  -- Tokens (estos deben ser encriptados en producción)
  access_token TEXT NOT NULL,
  bot_user_id VARCHAR(50),

  -- Metadata del workspace
  scope TEXT,
  authed_user_id VARCHAR(50),
  team_id VARCHAR(50),
  team_name VARCHAR(255),

  -- Estado de la conexión
  is_active BOOLEAN DEFAULT true,
  last_sync TIMESTAMP,

  -- Información adicional
  installation_data JSONB, -- Datos completos de la instalación

  -- Timestamps
  connected_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  -- Constraints
  UNIQUE(tenant_id, workspace_id)
);

-- Index para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_slack_connections_tenant ON slack_connections(tenant_id);
CREATE INDEX IF NOT EXISTS idx_slack_connections_workspace ON slack_connections(workspace_id);
CREATE INDEX IF NOT EXISTS idx_slack_connections_active ON slack_connections(is_active);

-- 2. Configuración del Bot por Tenant
CREATE TABLE IF NOT EXISTS slack_bot_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

  -- Apariencia del bot
  bot_name VARCHAR(100) DEFAULT 'Asistente',
  bot_emoji VARCHAR(50) DEFAULT ':robot_face:',
  bot_avatar_url TEXT,

  -- Configuración de IA
  ai_model VARCHAR(50) DEFAULT 'gpt-4', -- 'gpt-4', 'gpt-3.5-turbo', 'claude-3-sonnet', etc.
  system_prompt TEXT DEFAULT 'Eres un asistente útil y amigable.',
  temperature DECIMAL(3,2) DEFAULT 0.7 CHECK (temperature >= 0 AND temperature <= 2),
  max_tokens INTEGER DEFAULT 1000,

  -- Comportamiento del bot
  auto_respond BOOLEAN DEFAULT true, -- Responder automáticamente a mensajes
  respond_in_threads BOOLEAN DEFAULT true, -- Usar hilos para respuestas
  require_mention BOOLEAN DEFAULT false, -- Requiere que mencionen al bot

  -- Canales permitidos (null = todos)
  allowed_channels JSONB, -- ['C1234', 'C5678']

  -- Palabras clave para activar
  trigger_keywords JSONB, -- ['ayuda', 'soporte', 'consulta']

  -- Herramientas habilitadas
  enabled_tools JSONB DEFAULT '[]'::jsonb, -- ['web_search', 'calendar', 'crm']

  -- Horario de operación
  business_hours JSONB, -- {"start": "09:00", "end": "18:00", "timezone": "America/Lima"}

  -- Respuestas automáticas
  welcome_message TEXT,
  offline_message TEXT,

  -- Templates específicos por industria
  industry_template VARCHAR(50), -- 'inmobiliaria', 'clinica', 'ferreteria', etc.
  custom_responses JSONB, -- Respuestas predefinidas para preguntas frecuentes

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  -- Un config por tenant
  UNIQUE(tenant_id)
);

CREATE INDEX IF NOT EXISTS idx_slack_bot_configs_tenant ON slack_bot_configs(tenant_id);

-- 3. Mensajes de Slack (Log de conversaciones)
CREATE TABLE IF NOT EXISTS slack_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

  -- Identificadores de Slack
  channel_id VARCHAR(50) NOT NULL,
  channel_name VARCHAR(255),
  thread_ts VARCHAR(50), -- Thread timestamp (null si es mensaje principal)
  message_ts VARCHAR(50) NOT NULL UNIQUE, -- Message timestamp
  user_id VARCHAR(50) NOT NULL,
  user_name VARCHAR(255),

  -- Contenido del mensaje
  text TEXT,
  message_type VARCHAR(20) DEFAULT 'user', -- 'user', 'bot', 'system'

  -- Metadata de la respuesta del bot
  bot_response TEXT, -- La respuesta generada por el bot
  prompt_tokens INTEGER, -- Tokens usados en el prompt
  completion_tokens INTEGER, -- Tokens usados en la respuesta
  total_tokens INTEGER, -- Total de tokens
  model_used VARCHAR(50), -- Modelo usado para esta respuesta
  response_time_ms INTEGER, -- Tiempo de respuesta en milisegundos

  -- Estado de procesamiento
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
  error_message TEXT, -- Si falló, el mensaje de error

  -- Metadata adicional
  attachments JSONB, -- Archivos adjuntos
  reactions JSONB, -- Reacciones al mensaje
  metadata JSONB, -- Cualquier otra información

  -- Timestamps
  sent_at TIMESTAMP, -- Cuándo se envió el mensaje original
  processed_at TIMESTAMP, -- Cuándo se procesó
  created_at TIMESTAMP DEFAULT NOW(),

  -- Indexes para búsquedas
  INDEX idx_slack_messages_tenant (tenant_id),
  INDEX idx_slack_messages_channel (channel_id),
  INDEX idx_slack_messages_thread (thread_ts),
  INDEX idx_slack_messages_user (user_id),
  INDEX idx_slack_messages_status (status),
  INDEX idx_slack_messages_created (created_at DESC)
);

-- 4. Estadísticas de uso por Tenant
CREATE TABLE IF NOT EXISTS slack_usage_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

  -- Período
  date DATE NOT NULL,

  -- Métricas
  messages_received INTEGER DEFAULT 0,
  messages_sent INTEGER DEFAULT 0,
  unique_users INTEGER DEFAULT 0,
  unique_channels INTEGER DEFAULT 0,

  -- Tokens usados
  total_prompt_tokens INTEGER DEFAULT 0,
  total_completion_tokens INTEGER DEFAULT 0,
  total_tokens INTEGER DEFAULT 0,

  -- Costos estimados (en centavos USD)
  estimated_cost_cents INTEGER DEFAULT 0,

  -- Tiempo de respuesta promedio (ms)
  avg_response_time_ms INTEGER,

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  UNIQUE(tenant_id, date)
);

CREATE INDEX IF NOT EXISTS idx_slack_usage_stats_tenant ON slack_usage_stats(tenant_id);
CREATE INDEX IF NOT EXISTS idx_slack_usage_stats_date ON slack_usage_stats(date DESC);

-- 5. Trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Aplicar trigger a las tablas
CREATE TRIGGER update_slack_connections_updated_at BEFORE UPDATE ON slack_connections
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_slack_bot_configs_updated_at BEFORE UPDATE ON slack_bot_configs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_slack_usage_stats_updated_at BEFORE UPDATE ON slack_usage_stats
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Comentarios descriptivos
-- ============================================

COMMENT ON TABLE slack_connections IS 'Almacena las conexiones OAuth de cada tenant con sus workspaces de Slack';
COMMENT ON TABLE slack_bot_configs IS 'Configuración personalizada del bot de IA para cada tenant';
COMMENT ON TABLE slack_messages IS 'Log de todos los mensajes procesados por el bot';
COMMENT ON TABLE slack_usage_stats IS 'Estadísticas diarias de uso del bot por tenant';

COMMENT ON COLUMN slack_connections.access_token IS 'Token de acceso de Slack - DEBE SER ENCRIPTADO en producción';
COMMENT ON COLUMN slack_bot_configs.system_prompt IS 'Prompt del sistema que define la personalidad del bot';
COMMENT ON COLUMN slack_messages.message_ts IS 'Timestamp único del mensaje en Slack (formato: 1234567890.123456)';
COMMENT ON COLUMN slack_usage_stats.estimated_cost_cents IS 'Costo estimado en centavos de USD basado en tokens usados';
