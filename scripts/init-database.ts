import { config } from "dotenv";
import { neon } from "@neondatabase/serverless";
import bcrypt from "bcryptjs";

// Cargar variables de entorno
config({ path: ".env.local" });

const sql = neon(process.env.POSTGRES_URL!);

async function initDatabase() {
  console.log("🔄 Inicializando base de datos...\n");

  try {
    // 1. Crear tabla de usuarios
    console.log("📊 Creando tabla 'users'...");
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
    console.log("✅ Tabla 'users' creada\n");

    // 2. Crear índice para email
    console.log("📊 Creando índice para email...");
    await sql`
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)
    `;
    console.log("✅ Índice creado\n");

    // 3. Crear tabla de sesiones
    console.log("📊 Creando tabla 'sessions'...");
    await sql`
      CREATE TABLE IF NOT EXISTS sessions (
        id VARCHAR(255) PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        expires_at TIMESTAMP NOT NULL,
        last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log("✅ Tabla 'sessions' creada\n");

    // 4. Crear índices para sesiones
    console.log("📊 Creando índices para sesiones...");
    await sql`
      CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id)
    `;
    await sql`
      CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at)
    `;
    console.log("✅ Índices de sesiones creados\n");

    // 5. Crear usuarios demo
    console.log("👥 Creando usuarios demo...");

    const demoUsers = [
      {
        email: "admin@proconnect.com",
        password: "admin123",
        name: "Administrador",
        role: "admin",
      },
      {
        email: "demo@proconnect.com",
        password: "demo123",
        name: "Usuario Demo",
        role: "user",
      },
    ];

    for (const user of demoUsers) {
      // Verificar si ya existe
      const existing = await sql`
        SELECT id FROM users WHERE email = ${user.email}
      `;

      if (existing.length === 0) {
        const hashedPassword = await bcrypt.hash(user.password, 10);

        await sql`
          INSERT INTO users (email, password, name, role)
          VALUES (${user.email}, ${hashedPassword}, ${user.name}, ${user.role})
        `;

        console.log(`  ✅ Usuario creado: ${user.email}`);
      } else {
        console.log(`  ⏭️  Usuario ya existe: ${user.email}`);
      }
    }

    console.log("\n🎉 ¡Base de datos inicializada correctamente!\n");

    // Mostrar resumen
    const usersCount = await sql`SELECT COUNT(*) as count FROM users`;
    console.log(`📊 Usuarios totales: ${usersCount[0].count}`);

    process.exit(0);
  } catch (error) {
    console.error("\n❌ Error al inicializar base de datos:", error);
    process.exit(1);
  }
}

initDatabase();
