import { neon } from "@neondatabase/serverless";

// Obtener la conexión a la base de datos
// En desarrollo, usar una conexión local o de prueba
// En producción, Vercel inyectará automáticamente POSTGRES_URL
const getDatabaseUrl = () => {
  // Si existe la variable de entorno de Vercel/Neon
  if (process.env.POSTGRES_URL) {
    return process.env.POSTGRES_URL;
  }

  // Modo de desarrollo: usar base de datos en memoria (fallback)
  console.warn(
    "⚠️  POSTGRES_URL no configurado. Usando modo de desarrollo sin persistencia.",
  );
  return null;
};

const connectionString = getDatabaseUrl();

// Crear cliente de base de datos
export const sql = connectionString ? neon(connectionString) : null;

// Verificar si la base de datos está disponible
export const isDatabaseAvailable = () => sql !== null;

// Función para inicializar la base de datos
export async function initDatabase() {
  if (!sql) {
    console.warn(
      "⚠️  Base de datos no disponible. Usando almacenamiento en memoria.",
    );
    return false;
  }

  try {
    // Crear tabla de usuarios
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'user' NOT NULL,
        avatar VARCHAR(500),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_login TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Crear índice para email
    await sql`
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)
    `;

    // Crear tabla de sesiones
    await sql`
      CREATE TABLE IF NOT EXISTS sessions (
        id VARCHAR(255) PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        expires_at TIMESTAMP NOT NULL,
        last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Crear índices para sesiones
    await sql`
      CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id)
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at)
    `;

    console.log("✅ Base de datos inicializada correctamente");
    return true;
  } catch (error) {
    console.error("❌ Error al inicializar base de datos:", error);
    return false;
  }
}

// Función para limpiar sesiones expiradas
export async function cleanExpiredSessions() {
  if (!sql) return 0;

  try {
    const result = await sql`
      DELETE FROM sessions
      WHERE expires_at < NOW()
    `;
    if (result.length > 0) {
      console.log(`🧹 Sesiones expiradas eliminadas: ${result.length}`);
    }
    return result.length;
  } catch (error) {
    console.error("Error al limpiar sesiones:", error);
    return 0;
  }
}
