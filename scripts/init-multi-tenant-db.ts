import { config } from "dotenv";
config({ path: ".env" });

import { neon } from "@neondatabase/serverless";
import * as fs from "fs";
import * as path from "path";

const sql = neon(process.env.POSTGRES_URL!);

async function initMultiTenantDatabase() {
  console.log("🚀 Iniciando migración a multi-tenant...\n");

  try {
    // 1. Leer el schema SQL
    console.log("📄 Leyendo schema multi-tenant...");
    const schemaPath = path.join(__dirname, "../database/schema-multi-tenant.sql");
    const schema = fs.readFileSync(schemaPath, "utf-8");

    // 2. Dividir en statements individuales
    console.log("📝 Ejecutando migraciones...\n");

    // Crear extensiones
    console.log("  ✓ Creando extensiones...");
    await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;
    await sql`CREATE EXTENSION IF NOT EXISTS "pg_trgm"`;

    // 3. Crear tabla tenants
    console.log("  ✓ Creando tabla tenants...");
    await sql`
      CREATE TABLE IF NOT EXISTS tenants (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(100) UNIQUE NOT NULL,
        industry VARCHAR(100),
        plan VARCHAR(50) DEFAULT 'free',

        slack_workspace_id VARCHAR(255),
        slack_bot_token TEXT,
        slack_app_id VARCHAR(255),
        slack_team_name VARCHAR(255),

        ai_provider VARCHAR(50) DEFAULT 'openai',
        ai_model VARCHAR(100) DEFAULT 'gpt-4',
        ai_api_key TEXT,

        agent_name VARCHAR(100) DEFAULT 'Assistant',
        agent_instructions TEXT,
        agent_personality VARCHAR(50) DEFAULT 'professional',

        status VARCHAR(50) DEFAULT 'active',
        trial_ends_at TIMESTAMP,
        logo_url TEXT,
        website VARCHAR(500),
        contact_email VARCHAR(255),
        contact_phone VARCHAR(50),

        stripe_customer_id VARCHAR(255),
        stripe_subscription_id VARCHAR(255),

        max_users INTEGER DEFAULT 5,
        max_messages_per_month INTEGER DEFAULT 100,

        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        deleted_at TIMESTAMP
      )
    `;

    // 4. Índices para tenants
    console.log("  ✓ Creando índices para tenants...");
    await sql`CREATE INDEX IF NOT EXISTS idx_tenants_slug ON tenants(slug)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_tenants_status ON tenants(status)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_tenants_plan ON tenants(plan)`;

    // 5. Crear tabla users_new (temporal)
    console.log("  ✓ Creando nueva tabla users...");
    await sql`
      CREATE TABLE IF NOT EXISTS users_new (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

        email VARCHAR(255) NOT NULL,
        password VARCHAR(255) NOT NULL,
        email_verified BOOLEAN DEFAULT FALSE,
        email_verification_token VARCHAR(255),
        password_reset_token VARCHAR(255),
        password_reset_expires TIMESTAMP,

        name VARCHAR(255) NOT NULL,
        avatar VARCHAR(500),
        role VARCHAR(50) DEFAULT 'user',
        phone VARCHAR(50),

        slack_user_id VARCHAR(255),
        slack_username VARCHAR(255),

        last_login TIMESTAMP,
        last_active TIMESTAMP,
        login_count INTEGER DEFAULT 0,

        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

        UNIQUE(tenant_id, email)
      )
    `;

    // 6. Índices para users_new
    console.log("  ✓ Creando índices para users...");
    await sql`CREATE INDEX IF NOT EXISTS idx_users_new_tenant_id ON users_new(tenant_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_users_new_email ON users_new(email)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_users_new_role ON users_new(role)`;

    // 7. Crear tabla agent_configs
    console.log("  ✓ Creando tabla agent_configs...");
    await sql`
      CREATE TABLE IF NOT EXISTS agent_configs (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

        response_style VARCHAR(50) DEFAULT 'helpful',
        language VARCHAR(10) DEFAULT 'es',
        timezone VARCHAR(100) DEFAULT 'America/Lima',

        enabled_tools JSONB DEFAULT '[]',
        custom_prompts JSONB DEFAULT '{}',
        quick_replies JSONB DEFAULT '[]',

        profanity_filter BOOLEAN DEFAULT FALSE,
        blocked_words JSONB DEFAULT '[]',
        auto_escalation_keywords JSONB DEFAULT '[]',

        business_hours JSONB,
        out_of_hours_message TEXT,

        max_message_length INTEGER DEFAULT 2000,
        rate_limit_per_user INTEGER DEFAULT 10,

        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

        UNIQUE(tenant_id)
      )
    `;

    // 8. Crear tabla conversations
    console.log("  ✓ Creando tabla conversations...");
    await sql`
      CREATE TABLE IF NOT EXISTS conversations (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

        slack_channel_id VARCHAR(255) NOT NULL,
        slack_thread_ts VARCHAR(255),
        slack_user_id VARCHAR(255) NOT NULL,

        title TEXT,
        status VARCHAR(50) DEFAULT 'active',
        priority VARCHAR(50) DEFAULT 'normal',
        sentiment VARCHAR(50),

        tags JSONB DEFAULT '[]',
        category VARCHAR(100),

        assigned_to UUID REFERENCES users_new(id),
        escalated_at TIMESTAMP,
        resolved_at TIMESTAMP,

        message_count INTEGER DEFAULT 0,
        user_message_count INTEGER DEFAULT 0,
        agent_message_count INTEGER DEFAULT 0,
        avg_response_time INTEGER,

        started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_message_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        ended_at TIMESTAMP
      )
    `;

    // 9. Índices para conversations
    console.log("  ✓ Creando índices para conversations...");
    await sql`CREATE INDEX IF NOT EXISTS idx_conversations_tenant_id ON conversations(tenant_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_conversations_status ON conversations(status)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_conversations_slack_channel ON conversations(slack_channel_id)`;

    // 10. Crear tabla messages
    console.log("  ✓ Creando tabla messages...");
    await sql`
      CREATE TABLE IF NOT EXISTS messages (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

        role VARCHAR(50) NOT NULL,
        content TEXT NOT NULL,

        slack_message_ts VARCHAR(255),
        slack_user_id VARCHAR(255),

        model VARCHAR(100),
        tokens_used INTEGER DEFAULT 0,
        prompt_tokens INTEGER DEFAULT 0,
        completion_tokens INTEGER DEFAULT 0,
        finish_reason VARCHAR(50),

        tool_calls JSONB,
        tool_results JSONB,

        metadata JSONB,
        error TEXT,

        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // 11. Índices para messages
    console.log("  ✓ Creando índices para messages...");
    await sql`CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_messages_tenant_id ON messages(tenant_id)`;

    // 12. Crear tabla subscriptions
    console.log("  ✓ Creando tabla subscriptions...");
    await sql`
      CREATE TABLE IF NOT EXISTS subscriptions (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

        plan_name VARCHAR(50) NOT NULL,
        price DECIMAL(10, 2),
        billing_period VARCHAR(20),
        currency VARCHAR(3) DEFAULT 'USD',

        stripe_subscription_id VARCHAR(255),
        stripe_price_id VARCHAR(255),

        status VARCHAR(50) DEFAULT 'active',
        trial_start TIMESTAMP,
        trial_end TIMESTAMP,
        current_period_start TIMESTAMP,
        current_period_end TIMESTAMP,
        cancel_at TIMESTAMP,
        cancelled_at TIMESTAMP,

        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // 13. Crear tabla usage_metrics
    console.log("  ✓ Creando tabla usage_metrics...");
    await sql`
      CREATE TABLE IF NOT EXISTS usage_metrics (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

        date DATE NOT NULL,

        messages_sent INTEGER DEFAULT 0,
        messages_received INTEGER DEFAULT 0,
        tokens_used INTEGER DEFAULT 0,
        conversations_started INTEGER DEFAULT 0,
        conversations_resolved INTEGER DEFAULT 0,

        api_calls INTEGER DEFAULT 0,
        tool_calls INTEGER DEFAULT 0,

        active_users INTEGER DEFAULT 0,
        new_users INTEGER DEFAULT 0,

        avg_response_time INTEGER,
        median_response_time INTEGER,

        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

        UNIQUE(tenant_id, date)
      )
    `;

    // 14. Crear tabla activity_logs
    console.log("  ✓ Creando tabla activity_logs...");
    await sql`
      CREATE TABLE IF NOT EXISTS activity_logs (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        user_id UUID REFERENCES users_new(id) ON DELETE SET NULL,

        action VARCHAR(100) NOT NULL,
        resource VARCHAR(100) NOT NULL,
        resource_id UUID,

        details JSONB,
        ip_address VARCHAR(45),
        user_agent TEXT,

        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // 15. Triggers para updated_at
    console.log("  ✓ Creando triggers...");
    await sql`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql
    `;

    await sql`DROP TRIGGER IF EXISTS update_tenants_updated_at ON tenants`;
    await sql`
      CREATE TRIGGER update_tenants_updated_at
      BEFORE UPDATE ON tenants
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()
    `;

    await sql`DROP TRIGGER IF EXISTS update_users_new_updated_at ON users_new`;
    await sql`
      CREATE TRIGGER update_users_new_updated_at
      BEFORE UPDATE ON users_new
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()
    `;

    console.log("\n✅ Tablas creadas exitosamente!\n");

    // 16. Crear tenant por defecto (Soft ProConnect)
    console.log("🏢 Creando tenant por defecto...");
    const defaultTenant = await sql`
      INSERT INTO tenants (
        name,
        slug,
        industry,
        plan,
        status,
        contact_email
      )
      VALUES (
        'Soft ProConnect Peru SAC',
        'soft-proconnect',
        'technology',
        'enterprise',
        'active',
        'corp.infonet@gmail.com'
      )
      ON CONFLICT (slug) DO UPDATE
      SET name = EXCLUDED.name
      RETURNING id, name, slug
    `;

    console.log(`  ✓ Tenant creado: ${defaultTenant[0].name} (${defaultTenant[0].slug})`);
    const tenantId = defaultTenant[0].id;

    // 17. Migrar usuarios existentes
    console.log("\n👥 Migrando usuarios existentes...");

    // Verificar si hay usuarios en la tabla antigua
    const oldUsers = await sql`SELECT * FROM users WHERE 1=1`;

    if (oldUsers.length > 0) {
      console.log(`  📊 Encontrados ${oldUsers.length} usuarios para migrar`);

      for (const user of oldUsers) {
        await sql`
          INSERT INTO users_new (
            tenant_id,
            email,
            password,
            name,
            role,
            avatar,
            created_at,
            last_login
          )
          VALUES (
            ${tenantId},
            ${user.email},
            ${user.password},
            ${user.name},
            ${user.role},
            ${user.avatar},
            ${user.created_at},
            ${user.last_login}
          )
          ON CONFLICT (tenant_id, email) DO NOTHING
        `;
        console.log(`  ✓ Migrado: ${user.email}`);
      }
    } else {
      console.log("  ℹ️  No hay usuarios para migrar");
    }

    // 18. Crear configuración del agente por defecto
    console.log("\n⚙️  Creando configuración del agente...");
    await sql`
      INSERT INTO agent_configs (
        tenant_id,
        response_style,
        language,
        timezone,
        enabled_tools
      )
      VALUES (
        ${tenantId},
        'helpful',
        'es',
        'America/Lima',
        '["search_channels", "get_messages", "join_channel"]'::jsonb
      )
      ON CONFLICT (tenant_id) DO NOTHING
    `;
    console.log("  ✓ Configuración creada");

    console.log("\n" + "=".repeat(60));
    console.log("✅ MIGRACIÓN COMPLETADA EXITOSAMENTE!");
    console.log("=".repeat(60));
    console.log("\n📊 Resumen:");
    console.log(`  • Tenant creado: ${defaultTenant[0].name}`);
    console.log(`  • Usuarios migrados: ${oldUsers.length}`);
    console.log(`  • Tablas creadas: 10+`);
    console.log("\n🎯 Próximos pasos:");
    console.log("  1. Actualizar código de autenticación");
    console.log("  2. Adaptar queries para usar tenant_id");
    console.log("  3. Crear UI de registro de empresas");
    console.log("\n");

  } catch (error) {
    console.error("\n❌ Error en la migración:", error);
    process.exit(1);
  }
}

initMultiTenantDatabase();
