/**
 * Script para verificar la estructura actual de la base de datos
 */

import { config } from "dotenv";
import { neon } from "@neondatabase/serverless";

config();

const sql = neon(process.env.POSTGRES_URL!);

async function checkStructure() {
	console.log("🔍 Verificando estructura de la base de datos...\n");

	try {
		// Verificar tabla users
		console.log("📋 Estructura de tabla USERS:");
		const usersColumns = await sql`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'users'
      ORDER BY ordinal_position
    `;

		for (const col of usersColumns) {
			console.log(
				`   ${col.column_name.padEnd(20)} ${col.data_type.padEnd(20)} ${col.is_nullable === "YES" ? "NULL" : "NOT NULL"}`,
			);
		}

		// Verificar tabla tenants
		console.log("\n📋 Estructura de tabla TENANTS:");
		const tenantsColumns = await sql`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'tenants'
      ORDER BY ordinal_position
    `;

		for (const col of tenantsColumns) {
			console.log(
				`   ${col.column_name.padEnd(20)} ${col.data_type.padEnd(20)} ${col.is_nullable === "YES" ? "NULL" : "NOT NULL"}`,
			);
		}

		// Verificar tabla sessions
		console.log("\n📋 Estructura de tabla SESSIONS:");
		const sessionsColumns = await sql`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'sessions'
      ORDER BY ordinal_position
    `;

		if (sessionsColumns.length > 0) {
			for (const col of sessionsColumns) {
				console.log(
					`   ${col.column_name.padEnd(20)} ${col.data_type.padEnd(20)} ${col.is_nullable === "YES" ? "NULL" : "NOT NULL"}`,
				);
			}
		} else {
			console.log("   ⚠️  Tabla no existe");
		}

		console.log("");
	} catch (error) {
		console.error("❌ Error:", error);
		process.exit(1);
	}
}

checkStructure()
	.then(() => {
		process.exit(0);
	})
	.catch((error) => {
		console.error("💥 Error:", error);
		process.exit(1);
	});
