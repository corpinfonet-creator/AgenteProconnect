/**
 * Servicio para gestionar conexiones de Slack
 * Maneja OAuth, tokens y workspaces
 */

import { sql } from "../db/client";

export interface SlackConnection {
	id: string;
	tenant_id: string;
	workspace_id: string;
	workspace_name: string | null;
	access_token: string;
	bot_user_id: string | null;
	scope: string | null;
	authed_user_id: string | null;
	team_id: string | null;
	team_name: string | null;
	is_active: boolean;
	last_sync: Date | null;
	installation_data: Record<string, any> | null;
	connected_at: Date;
	updated_at: Date;
}

export interface CreateConnectionData {
	tenant_id: string;
	workspace_id: string;
	workspace_name?: string;
	access_token: string;
	bot_user_id?: string;
	scope?: string;
	authed_user_id?: string;
	team_id?: string;
	team_name?: string;
	installation_data?: Record<string, any>;
}

export class SlackConnectionService {
	/**
	 * Obtener conexión activa de un tenant
	 */
	static async getByTenant(
		tenantId: string,
	): Promise<SlackConnection | null> {
		const result = await sql`
      SELECT * FROM slack_connections
      WHERE tenant_id = ${tenantId}
      AND is_active = true
      LIMIT 1
    `;

		return result.length > 0 ? (result[0] as SlackConnection) : null;
	}

	/**
	 * Obtener conexión por workspace
	 */
	static async getByWorkspace(
		workspaceId: string,
	): Promise<SlackConnection | null> {
		const result = await sql`
      SELECT * FROM slack_connections
      WHERE workspace_id = ${workspaceId}
      AND is_active = true
      LIMIT 1
    `;

		return result.length > 0 ? (result[0] as SlackConnection) : null;
	}

	/**
	 * Crear o actualizar conexión
	 */
	static async upsert(data: CreateConnectionData): Promise<SlackConnection> {
		const result = await sql`
      INSERT INTO slack_connections (
        tenant_id,
        workspace_id,
        workspace_name,
        access_token,
        bot_user_id,
        scope,
        authed_user_id,
        team_id,
        team_name,
        installation_data
      ) VALUES (
        ${data.tenant_id},
        ${data.workspace_id},
        ${data.workspace_name || null},
        ${data.access_token},
        ${data.bot_user_id || null},
        ${data.scope || null},
        ${data.authed_user_id || null},
        ${data.team_id || null},
        ${data.team_name || null},
        ${data.installation_data ? JSON.stringify(data.installation_data) : null}
      )
      ON CONFLICT (tenant_id, workspace_id)
      DO UPDATE SET
        workspace_name = EXCLUDED.workspace_name,
        access_token = EXCLUDED.access_token,
        bot_user_id = EXCLUDED.bot_user_id,
        scope = EXCLUDED.scope,
        authed_user_id = EXCLUDED.authed_user_id,
        team_id = EXCLUDED.team_id,
        team_name = EXCLUDED.team_name,
        installation_data = EXCLUDED.installation_data,
        is_active = true,
        updated_at = NOW()
      RETURNING *
    `;

		return result[0] as SlackConnection;
	}

	/**
	 * Desactivar conexión
	 */
	static async disconnect(tenantId: string): Promise<boolean> {
		const result = await sql`
      UPDATE slack_connections
      SET is_active = false, updated_at = NOW()
      WHERE tenant_id = ${tenantId}
      RETURNING id
    `;

		return result.length > 0;
	}

	/**
	 * Verificar si un tenant tiene Slack conectado
	 */
	static async isConnected(tenantId: string): Promise<boolean> {
		const result = await sql`
      SELECT id FROM slack_connections
      WHERE tenant_id = ${tenantId}
      AND is_active = true
      LIMIT 1
    `;

		return result.length > 0;
	}

	/**
	 * Actualizar última sincronización
	 */
	static async updateLastSync(connectionId: string): Promise<void> {
		await sql`
      UPDATE slack_connections
      SET last_sync = NOW(), updated_at = NOW()
      WHERE id = ${connectionId}
    `;
	}

	/**
	 * Obtener token de acceso para un tenant
	 */
	static async getAccessToken(tenantId: string): Promise<string | null> {
		const result = await sql`
      SELECT access_token FROM slack_connections
      WHERE tenant_id = ${tenantId}
      AND is_active = true
      LIMIT 1
    `;

		return result.length > 0 ? result[0].access_token : null;
	}

	/**
	 * Listar todas las conexiones (para admin)
	 */
	static async listAll(limit = 50, offset = 0): Promise<SlackConnection[]> {
		const result = await sql`
      SELECT * FROM slack_connections
      ORDER BY connected_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;

		return result as SlackConnection[];
	}

	/**
	 * Obtener estadísticas de conexiones
	 */
	static async getStats(): Promise<{
		total: number;
		active: number;
		inactive: number;
	}> {
		const result = await sql`
      SELECT
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE is_active = true) as active,
        COUNT(*) FILTER (WHERE is_active = false) as inactive
      FROM slack_connections
    `;

		return {
			total: Number(result[0].total),
			active: Number(result[0].active),
			inactive: Number(result[0].inactive),
		};
	}
}
