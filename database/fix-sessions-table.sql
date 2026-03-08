-- ============================================
-- Fix: Actualizar tabla sessions para usar UUIDs
-- ============================================

-- Eliminar tabla antigua si existe
DROP TABLE IF EXISTS sessions CASCADE;

-- Crear tabla sessions con UUID
CREATE TABLE sessions (
    id VARCHAR(255) PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para rendimiento
CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_expires_at ON sessions(expires_at);

-- Comentario
COMMENT ON TABLE sessions IS 'Sesiones de usuarios con soporte para UUIDs';
