/**
 * Script para crear las tablas de integración con Slack
 * FASE 3: Slack Integration
 */

import { config } from "dotenv";
import { neon } from "@neondatabase/serverless";
import { readFileSync } from "fs";
import { join } from "path";

// Cargar variables de entorno
config();

const sql = neon(process.env.POSTGRES_URL!);

async function initSlackTables() {
	console.log("🚀 Iniciando creación de tablas de Slack...\n");

	try {
		console.log("📝 Creando tablas...");

		// 1. Crear tabla slack_connections
		await sql`
      CREATE TABLE IF NOT EXISTS slack_connections (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        workspace_id VARCHAR(50) NOT NULL,
        workspace_name VARCHAR(255),
        access_token TEXT NOT NULL,
        bot_user_id VARCHAR(50),
        scope TEXT,
        authed_user_id VARCHAR(50),
        team_id VARCHAR(50),
        team_name VARCHAR(255),
        is_active BOOLEAN DEFAULT true,
        last_sync TIMESTAMP,
        installation_data JSONB,
        connected_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(tenant_id, workspace_id)
      )
    `;
		console.log("   ✅ slack_connections");

		// 2. Crear tabla slack_bot_configs
		await sql`
      CREATE TABLE IF NOT EXISTS slack_bot_configs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        bot_name VARCHAR(100) DEFAULT 'Asistente',
        bot_emoji VARCHAR(50) DEFAULT ':robot_face:',
        bot_avatar_url TEXT,
        ai_model VARCHAR(50) DEFAULT 'gpt-4',
        system_prompt TEXT DEFAULT 'Eres un asistente útil y amigable.',
        temperature DECIMAL(3,2) DEFAULT 0.7 CHECK (temperature >= 0 AND temperature <= 2),
        max_tokens INTEGER DEFAULT 1000,
        auto_respond BOOLEAN DEFAULT true,
        respond_in_threads BOOLEAN DEFAULT true,
        require_mention BOOLEAN DEFAULT false,
        allowed_channels JSONB,
        trigger_keywords JSONB,
        enabled_tools JSONB DEFAULT '[]'::jsonb,
        business_hours JSONB,
        welcome_message TEXT,
        offline_message TEXT,
        industry_template VARCHAR(50),
        custom_responses JSONB,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(tenant_id)
      )
    `;
		console.log("   ✅ slack_bot_configs");

		// 3. Crear tabla slack_messages
		await sql`
      CREATE TABLE IF NOT EXISTS slack_messages (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        channel_id VARCHAR(50) NOT NULL,
        channel_name VARCHAR(255),
        thread_ts VARCHAR(50),
        message_ts VARCHAR(50) NOT NULL UNIQUE,
        user_id VARCHAR(50) NOT NULL,
        user_name VARCHAR(255),
        text TEXT,
        message_type VARCHAR(20) DEFAULT 'user',
        bot_response TEXT,
        prompt_tokens INTEGER,
        completion_tokens INTEGER,
        total_tokens INTEGER,
        model_used VARCHAR(50),
        response_time_ms INTEGER,
        status VARCHAR(20) DEFAULT 'pending',
        error_message TEXT,
        attachments JSONB,
        reactions JSONB,
        metadata JSONB,
        sent_at TIMESTAMP,
        processed_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;
		console.log("   ✅ slack_messages");

		// 4. Crear tabla slack_usage_stats
		await sql`
      CREATE TABLE IF NOT EXISTS slack_usage_stats (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        date DATE NOT NULL,
        messages_received INTEGER DEFAULT 0,
        messages_sent INTEGER DEFAULT 0,
        unique_users INTEGER DEFAULT 0,
        unique_channels INTEGER DEFAULT 0,
        total_prompt_tokens INTEGER DEFAULT 0,
        total_completion_tokens INTEGER DEFAULT 0,
        total_tokens INTEGER DEFAULT 0,
        estimated_cost_cents INTEGER DEFAULT 0,
        avg_response_time_ms INTEGER,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(tenant_id, date)
      )
    `;
		console.log("   ✅ slack_usage_stats");

		// 5. Crear índices
		console.log("\n📊 Creando índices...");

		await sql`CREATE INDEX IF NOT EXISTS idx_slack_connections_tenant ON slack_connections(tenant_id)`;
		await sql`CREATE INDEX IF NOT EXISTS idx_slack_connections_workspace ON slack_connections(workspace_id)`;
		await sql`CREATE INDEX IF NOT EXISTS idx_slack_connections_active ON slack_connections(is_active)`;

		await sql`CREATE INDEX IF NOT EXISTS idx_slack_bot_configs_tenant ON slack_bot_configs(tenant_id)`;

		await sql`CREATE INDEX IF NOT EXISTS idx_slack_messages_tenant ON slack_messages(tenant_id)`;
		await sql`CREATE INDEX IF NOT EXISTS idx_slack_messages_channel ON slack_messages(channel_id)`;
		await sql`CREATE INDEX IF NOT EXISTS idx_slack_messages_thread ON slack_messages(thread_ts)`;
		await sql`CREATE INDEX IF NOT EXISTS idx_slack_messages_user ON slack_messages(user_id)`;
		await sql`CREATE INDEX IF NOT EXISTS idx_slack_messages_status ON slack_messages(status)`;
		await sql`CREATE INDEX IF NOT EXISTS idx_slack_messages_created ON slack_messages(created_at DESC)`;

		await sql`CREATE INDEX IF NOT EXISTS idx_slack_usage_stats_tenant ON slack_usage_stats(tenant_id)`;
		await sql`CREATE INDEX IF NOT EXISTS idx_slack_usage_stats_date ON slack_usage_stats(date DESC)`;

		console.log("   ✅ Índices creados");

		console.log("\n✅ Tablas creadas correctamente\n");

		// Verificar que las tablas se crearon
		console.log("🔍 Verificando tablas creadas...\n");

		const tables = await sql`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name IN ('slack_connections', 'slack_bot_configs', 'slack_messages', 'slack_usage_stats')
      ORDER BY table_name
    `;

		console.log("📋 Tablas encontradas:");
		for (const table of tables) {
			console.log(`   ✅ ${table.table_name}`);
		}

		// Crear configuración por defecto para el tenant existente
		console.log("\n⚙️ Creando configuración por defecto...");

		// Obtener el tenant por defecto
		const tenants = await sql`
      SELECT id, name, slug FROM tenants LIMIT 1
    `;

		if (tenants.length > 0) {
			const tenant = tenants[0];
			console.log(`   📍 Tenant encontrado: ${tenant.name} (${tenant.slug})`);

			// Crear configuración del bot por defecto
			const existingConfig = await sql`
        SELECT id FROM slack_bot_configs WHERE tenant_id = ${tenant.id}
      `;

			if (existingConfig.length === 0) {
				await sql`
          INSERT INTO slack_bot_configs (
            tenant_id,
            bot_name,
            bot_emoji,
            ai_model,
            system_prompt,
            temperature,
            max_tokens,
            auto_respond,
            respond_in_threads,
            require_mention
          ) VALUES (
            ${tenant.id},
            'Asistente IA',
            ':robot_face:',
            'gpt-4',
            'Eres un asistente virtual inteligente y amigable. Ayudas a los usuarios con sus consultas de manera profesional y eficiente.',
            0.7,
            1000,
            true,
            true,
            false
          )
        `;
				console.log("   ✅ Configuración del bot creada");
			} else {
				console.log("   ℹ️  Configuración del bot ya existe");
			}
		} else {
			console.log("   ⚠️  No se encontró ningún tenant");
		}

		// Mostrar resumen
		console.log("\n" + "=".repeat(50));
		console.log("✅ MIGRACIÓN COMPLETADA EXITOSAMENTE");
		console.log("=".repeat(50));

		console.log("\n📊 Resumen de tablas creadas:");
		console.log("   • slack_connections - Conexiones OAuth con Slack");
		console.log("   • slack_bot_configs - Configuración del bot por tenant");
		console.log("   • slack_messages - Log de mensajes");
		console.log("   • slack_usage_stats - Estadísticas de uso");

		console.log("\n🎯 Próximos pasos:");
		console.log("   1. Crear Slack App en https://api.slack.com/apps");
		console.log("   2. Configurar OAuth en la app");
		console.log("   3. Agregar credenciales al .env");
		console.log("   4. Implementar endpoints de OAuth");
		console.log("   5. Implementar webhook de eventos");

		console.log("");
	} catch (error) {
		console.error("❌ Error al crear tablas:", error);
		process.exit(1);
	}
}

// Ejecutar
initSlackTables()
	.then(() => {
		console.log("✨ Script completado\n");
		process.exit(0);
	})
	.catch((error) => {
		console.error("💥 Error fatal:", error);
		process.exit(1);
	});
