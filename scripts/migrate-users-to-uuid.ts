/**
 * Script para migrar la tabla users de INTEGER a UUID
 * y agregar tenant_id
 */

import { config } from "dotenv";
import { neon } from "@neondatabase/serverless";

config();

const sql = neon(process.env.POSTGRES_URL!);

async function migrateUsers() {
	console.log("🔄 Migrando tabla users a UUID + tenant_id...\n");

	try {
		// 1. Obtener tenant por defecto
		console.log("📍 Buscando tenant por defecto...");
		const tenants = await sql`SELECT id, name FROM tenants LIMIT 1`;

		if (tenants.length === 0) {
			console.error("❌ No hay tenants en la BD. Ejecuta db:migrate primero");
			process.exit(1);
		}

		const defaultTenant = tenants[0];
		console.log(
			`   ✅ Tenant encontrado: ${defaultTenant.name} (${defaultTenant.id})\n`,
		);

		// 2. Obtener usuarios existentes
		console.log("📋 Obteniendo usuarios existentes...");
		const oldUsers = await sql`SELECT * FROM users`;
		console.log(`   ✅ ${oldUsers.length} usuarios encontrados\n`);

		// 3. Eliminar tabla sessions (depende de users)
		console.log("📝 Eliminando tabla sessions...");
		await sql`DROP TABLE IF EXISTS sessions CASCADE`;
		console.log("   ✅ Tabla sessions eliminada\n");

		// 4. Respaldar y eliminar tabla users
		console.log("💾 Respaldando datos de usuarios...");
		const usersBackup = oldUsers.map((u) => ({
			email: u.email,
			password: u.password,
			name: u.name,
			role: u.role,
			avatar: u.avatar,
			last_login: u.last_login,
		}));
		console.log("   ✅ Datos respaldados\n");

		console.log("📝 Eliminando tabla users antigua...");
		await sql`DROP TABLE IF EXISTS users CASCADE`;
		console.log("   ✅ Tabla eliminada\n");

		// 5. Crear nueva tabla users con UUID
		console.log("📝 Creando nueva tabla users con UUID...");
		await sql`
      CREATE TABLE users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'user',
        avatar TEXT,
        last_login TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
		console.log("   ✅ Tabla users creada\n");

		// 6. Crear índices
		console.log("📝 Creando índices...");
		await sql`CREATE INDEX idx_users_tenant_id ON users(tenant_id)`;
		await sql`CREATE INDEX idx_users_email ON users(email)`;
		await sql`CREATE INDEX idx_users_role ON users(role)`;
		console.log("   ✅ Índices creados\n");

		// 7. Restaurar usuarios con tenant_id
		console.log("📝 Restaurando usuarios...");
		for (const user of usersBackup) {
			await sql`
        INSERT INTO users (tenant_id, email, password, name, role, avatar, last_login)
        VALUES (
          ${defaultTenant.id},
          ${user.email},
          ${user.password},
          ${user.name},
          ${user.role},
          ${user.avatar || null},
          ${user.last_login || null}
        )
      `;
		}
		console.log(`   ✅ ${usersBackup.length} usuarios restaurados\n`);

		// 8. Crear tabla sessions
		console.log("📝 Creando tabla sessions...");
		await sql`
      CREATE TABLE sessions (
        id VARCHAR(255) PRIMARY KEY,
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        expires_at TIMESTAMP NOT NULL,
        last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
		await sql`CREATE INDEX idx_sessions_user_id ON sessions(user_id)`;
		await sql`CREATE INDEX idx_sessions_expires_at ON sessions(expires_at)`;
		console.log("   ✅ Tabla sessions creada\n");

		// 9. Verificar
		console.log("🔍 Verificando migración...");
		const newUsers = await sql`SELECT id, email, name, tenant_id FROM users`;
		console.log(`   ✅ ${newUsers.length} usuarios en nueva tabla\n`);

		console.log("📊 Usuarios migrados:");
		for (const user of newUsers) {
			console.log(
				`   • ${user.email.padEnd(30)} (${user.name})`,
			);
		}

		console.log("\n" + "=".repeat(60));
		console.log("✅ MIGRACIÓN COMPLETADA EXITOSAMENTE");
		console.log("=".repeat(60));

		console.log("\n🎯 Cambios realizados:");
		console.log("   • Tabla users migrada a UUID");
		console.log("   • Campo tenant_id agregado");
		console.log("   • Todos los usuarios asignados al tenant por defecto");
		console.log("   • Tabla sessions recreada con soporte UUID");
		console.log("   • Índices optimizados creados");

		console.log("\n✨ Ahora puedes iniciar sesión sin errores\n");
	} catch (error) {
		console.error("❌ Error:", error);
		process.exit(1);
	}
}

migrateUsers()
	.then(() => {
		console.log("✨ Migración completada\n");
		process.exit(0);
	})
	.catch((error) => {
		console.error("💥 Error fatal:", error);
		process.exit(1);
	});
