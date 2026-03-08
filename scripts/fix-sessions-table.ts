/**
 * Script para arreglar la tabla sessions y hacerla compatible con UUIDs
 */

import { config } from "dotenv";
import { neon } from "@neondatabase/serverless";

// Cargar variables de entorno
config();

const sql = neon(process.env.POSTGRES_URL!);

async function fixSessionsTable() {
	console.log("🔧 Arreglando tabla sessions...\n");

	try {
		// Eliminar tabla antigua
		console.log("📝 Eliminando tabla sessions antigua...");
		await sql`DROP TABLE IF EXISTS sessions CASCADE`;
		console.log("   ✅ Tabla eliminada\n");

		// Crear nueva tabla con UUID
		console.log("📝 Creando nueva tabla sessions con UUIDs...");
		await sql`
      CREATE TABLE sessions (
        id VARCHAR(255) PRIMARY KEY,
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        expires_at TIMESTAMP NOT NULL,
        last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
		console.log("   ✅ Tabla creada\n");

		// Crear índices
		console.log("📝 Creando índices...");
		await sql`CREATE INDEX idx_sessions_user_id ON sessions(user_id)`;
		await sql`CREATE INDEX idx_sessions_expires_at ON sessions(expires_at)`;
		console.log("   ✅ Índices creados\n");

		// Verificar
		const result = await sql`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'sessions'
      ORDER BY ordinal_position
    `;

		console.log("📊 Estructura de la tabla sessions:");
		for (const col of result) {
			console.log(`   • ${col.column_name}: ${col.data_type}`);
		}

		console.log("\n" + "=".repeat(50));
		console.log("✅ TABLA SESSIONS ACTUALIZADA CORRECTAMENTE");
		console.log("=".repeat(50));

		console.log("\n🎯 Ahora puedes iniciar sesión sin errores\n");
	} catch (error) {
		console.error("❌ Error:", error);
		process.exit(1);
	}
}

fixSessionsTable()
	.then(() => {
		console.log("✨ Completado\n");
		process.exit(0);
	})
	.catch((error) => {
		console.error("💥 Error fatal:", error);
		process.exit(1);
	});
