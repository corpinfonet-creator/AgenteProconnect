/**
 * Servicio para gestionar la configuración del bot de Slack
 */

import { sql } from "../db/client";

export interface SlackBotConfig {
	id: string;
	tenant_id: string;
	bot_name: string;
	bot_emoji: string;
	bot_avatar_url: string | null;
	ai_model: string;
	system_prompt: string;
	temperature: number;
	max_tokens: number;
	auto_respond: boolean;
	respond_in_threads: boolean;
	require_mention: boolean;
	allowed_channels: string[] | null;
	trigger_keywords: string[] | null;
	enabled_tools: string[];
	business_hours: Record<string, any> | null;
	welcome_message: string | null;
	offline_message: string | null;
	industry_template: string | null;
	custom_responses: Record<string, any> | null;
	created_at: Date;
	updated_at: Date;
}

export interface UpdateBotConfigData {
	bot_name?: string;
	bot_emoji?: string;
	bot_avatar_url?: string | null;
	ai_model?: string;
	system_prompt?: string;
	temperature?: number;
	max_tokens?: number;
	auto_respond?: boolean;
	respond_in_threads?: boolean;
	require_mention?: boolean;
	allowed_channels?: string[] | null;
	trigger_keywords?: string[] | null;
	enabled_tools?: string[];
	business_hours?: Record<string, any> | null;
	welcome_message?: string | null;
	offline_message?: string | null;
	industry_template?: string | null;
	custom_responses?: Record<string, any> | null;
}

export class SlackBotConfigService {
	/**
	 * Obtener configuración del bot para un tenant
	 */
	static async getByTenant(tenantId: string): Promise<SlackBotConfig | null> {
		const result = await sql`
      SELECT * FROM slack_bot_configs
      WHERE tenant_id = ${tenantId}
      LIMIT 1
    `;

		return result.length > 0 ? (result[0] as SlackBotConfig) : null;
	}

	/**
	 * Crear configuración por defecto para un tenant
	 */
	static async createDefault(
		tenantId: string,
		industryTemplate?: string,
	): Promise<SlackBotConfig> {
		// Templates de prompts por industria
		const industryPrompts: Record<string, string> = {
			inmobiliaria:
				"Eres un asistente virtual especializado en bienes raíces. Ayudas con consultas sobre propiedades, visitas, precios y documentación inmobiliaria. Eres profesional, servicial y conoces el mercado inmobiliario peruano.",
			clinica:
				"Eres un asistente virtual de una clínica. Ayudas con citas médicas, información de servicios, horarios de atención y consultas generales. Eres empático, profesional y respetuoso con la privacidad del paciente.",
			ferreteria:
				"Eres un asistente virtual de una ferretería. Ayudas con información de productos, stock, precios, y recomendaciones para proyectos de construcción y remodelación. Conoces bien materiales de construcción y herramientas.",
			tienda_ropa:
				"Eres un asistente virtual de una tienda de ropa. Ayudas con catálogo de productos, tallas, disponibilidad, tendencias de moda y recomendaciones de estilo. Eres amigable y conoces bien la moda.",
			tecnologia:
				"Eres un asistente virtual de una empresa de tecnología. Ayudas con soporte técnico, información de productos, servicios IT y consultas técnicas. Eres preciso, técnico cuando es necesario y didáctico.",
			restaurante:
				"Eres un asistente virtual de un restaurante. Ayudas con reservas, menú, horarios, delivery y recomendaciones gastronómicas. Eres amigable, conoces bien la carta y haces sentir bien a los clientes.",
			educacion:
				"Eres un asistente virtual de una institución educativa. Ayudas con información de cursos, horarios, inscripciones y consultas académicas. Eres claro, organizado y motivador.",
			default:
				"Eres un asistente virtual inteligente y amigable. Ayudas a los usuarios con sus consultas de manera profesional y eficiente. Siempre eres cortés y proporcionas información útil y precisa.",
		};

		const systemPrompt =
			industryPrompts[industryTemplate || ""] || industryPrompts.default;

		const result = await sql`
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
        require_mention,
        industry_template
      ) VALUES (
        ${tenantId},
        'Asistente IA',
        ':robot_face:',
        'gpt-4',
        ${systemPrompt},
        0.7,
        1000,
        true,
        true,
        false,
        ${industryTemplate || null}
      )
      ON CONFLICT (tenant_id) DO NOTHING
      RETURNING *
    `;

		if (result.length === 0) {
			// Ya existe, obtenerlo
			return (await this.getByTenant(tenantId))!;
		}

		return result[0] as SlackBotConfig;
	}

	/**
	 * Actualizar configuración del bot
	 */
	static async update(
		tenantId: string,
		data: UpdateBotConfigData,
	): Promise<SlackBotConfig> {
		// Construir el objeto de actualización dinámicamente
		const updates: string[] = [];
		const values: any[] = [];
		let paramCount = 1;

		if (data.bot_name !== undefined) {
			updates.push(`bot_name = $${paramCount++}`);
			values.push(data.bot_name);
		}
		if (data.bot_emoji !== undefined) {
			updates.push(`bot_emoji = $${paramCount++}`);
			values.push(data.bot_emoji);
		}
		if (data.bot_avatar_url !== undefined) {
			updates.push(`bot_avatar_url = $${paramCount++}`);
			values.push(data.bot_avatar_url);
		}
		if (data.ai_model !== undefined) {
			updates.push(`ai_model = $${paramCount++}`);
			values.push(data.ai_model);
		}
		if (data.system_prompt !== undefined) {
			updates.push(`system_prompt = $${paramCount++}`);
			values.push(data.system_prompt);
		}
		if (data.temperature !== undefined) {
			updates.push(`temperature = $${paramCount++}`);
			values.push(data.temperature);
		}
		if (data.max_tokens !== undefined) {
			updates.push(`max_tokens = $${paramCount++}`);
			values.push(data.max_tokens);
		}
		if (data.auto_respond !== undefined) {
			updates.push(`auto_respond = $${paramCount++}`);
			values.push(data.auto_respond);
		}
		if (data.respond_in_threads !== undefined) {
			updates.push(`respond_in_threads = $${paramCount++}`);
			values.push(data.respond_in_threads);
		}
		if (data.require_mention !== undefined) {
			updates.push(`require_mention = $${paramCount++}`);
			values.push(data.require_mention);
		}
		if (data.allowed_channels !== undefined) {
			updates.push(`allowed_channels = $${paramCount++}`);
			values.push(JSON.stringify(data.allowed_channels));
		}
		if (data.trigger_keywords !== undefined) {
			updates.push(`trigger_keywords = $${paramCount++}`);
			values.push(JSON.stringify(data.trigger_keywords));
		}
		if (data.enabled_tools !== undefined) {
			updates.push(`enabled_tools = $${paramCount++}`);
			values.push(JSON.stringify(data.enabled_tools));
		}
		if (data.business_hours !== undefined) {
			updates.push(`business_hours = $${paramCount++}`);
			values.push(JSON.stringify(data.business_hours));
		}
		if (data.welcome_message !== undefined) {
			updates.push(`welcome_message = $${paramCount++}`);
			values.push(data.welcome_message);
		}
		if (data.offline_message !== undefined) {
			updates.push(`offline_message = $${paramCount++}`);
			values.push(data.offline_message);
		}
		if (data.industry_template !== undefined) {
			updates.push(`industry_template = $${paramCount++}`);
			values.push(data.industry_template);
		}
		if (data.custom_responses !== undefined) {
			updates.push(`custom_responses = $${paramCount++}`);
			values.push(JSON.stringify(data.custom_responses));
		}

		updates.push("updated_at = NOW()");

		const result = await sql`
      UPDATE slack_bot_configs
      SET ${sql.unsafe(updates.join(", "))}
      WHERE tenant_id = ${tenantId}
      RETURNING *
    `;

		return result[0] as SlackBotConfig;
	}

	/**
	 * Obtener prompt del sistema para un tenant
	 */
	static async getSystemPrompt(tenantId: string): Promise<string> {
		const config = await this.getByTenant(tenantId);
		return (
			config?.system_prompt ||
			"Eres un asistente virtual útil y amigable."
		);
	}

	/**
	 * Verificar si el bot está en horario de atención
	 */
	static async isInBusinessHours(tenantId: string): Promise<boolean> {
		const config = await this.getByTenant(tenantId);

		if (!config?.business_hours) {
			// Si no hay horario configurado, siempre está disponible
			return true;
		}

		// TODO: Implementar lógica de horarios
		// Por ahora retornar true
		return true;
	}

	/**
	 * Verificar si el bot debe responder en un canal específico
	 */
	static async shouldRespondInChannel(
		tenantId: string,
		channelId: string,
	): Promise<boolean> {
		const config = await this.getByTenant(tenantId);

		if (!config) return false;
		if (!config.auto_respond) return false;

		// Si no hay canales permitidos configurados, responder en todos
		if (!config.allowed_channels || config.allowed_channels.length === 0) {
			return true;
		}

		// Verificar si el canal está en la lista de permitidos
		return config.allowed_channels.includes(channelId);
	}

	/**
	 * Obtener templates de industria disponibles
	 */
	static getIndustryTemplates(): Array<{
		value: string;
		label: string;
		description: string;
	}> {
		return [
			{
				value: "inmobiliaria",
				label: "🏢 Inmobiliaria",
				description: "Especializado en bienes raíces y propiedades",
			},
			{
				value: "clinica",
				label: "🏥 Clínica / Salud",
				description: "Asistente médico para citas y consultas",
			},
			{
				value: "ferreteria",
				label: "🔧 Ferretería",
				description: "Experto en materiales de construcción",
			},
			{
				value: "tienda_ropa",
				label: "👗 Tienda de Ropa",
				description: "Asesor de moda y catálogo",
			},
			{
				value: "tecnologia",
				label: "💻 Tecnología",
				description: "Soporte técnico y servicios IT",
			},
			{
				value: "restaurante",
				label: "🍽️ Restaurante",
				description: "Reservas y recomendaciones gastronómicas",
			},
			{
				value: "educacion",
				label: "📚 Educación",
				description: "Información académica y cursos",
			},
			{
				value: "default",
				label: "🏪 General",
				description: "Asistente versátil para cualquier industria",
			},
		];
	}

	/**
	 * Obtener modelos de IA disponibles
	 */
	static getAvailableModels(): Array<{
		value: string;
		label: string;
		description: string;
		cost: string;
	}> {
		return [
			{
				value: "gpt-4",
				label: "GPT-4",
				description: "Más potente y preciso",
				cost: "$$$",
			},
			{
				value: "gpt-3.5-turbo",
				label: "GPT-3.5 Turbo",
				description: "Rápido y económico",
				cost: "$",
			},
			{
				value: "claude-3-sonnet",
				label: "Claude 3 Sonnet",
				description: "Balance perfecto",
				cost: "$$",
			},
			{
				value: "claude-3-haiku",
				label: "Claude 3 Haiku",
				description: "Ultra rápido",
				cost: "$",
			},
		];
	}
}
