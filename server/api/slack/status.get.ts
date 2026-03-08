/**
 * Endpoint para obtener el estado de la conexión con Slack
 */

import { SessionService } from "../../lib/auth/session";
import { UserService } from "../../lib/auth/users-multi-tenant";
import { SlackConnectionService } from "../../lib/slack/connections";

export default defineEventHandler(async (event) => {
	// Verificar autenticación
	const session = await SessionService.getFromEvent(event);

	if (!session) {
		setResponseStatus(event, 401);
		return {
			success: false,
			error: "Unauthorized",
		};
	}

	try {
		// Obtener usuario y tenant
		const user = await UserService.findById(session.user_id);
		if (!user || !user.tenant_id) {
			setResponseStatus(event, 404);
			return {
				success: false,
				error: "User or tenant not found",
			};
		}

		// Obtener conexión
		const connection =
			await SlackConnectionService.getByTenant(user.tenant_id);

		if (!connection) {
			return {
				success: true,
				connected: false,
				connection: null,
			};
		}

		// Retornar estado (sin el token por seguridad)
		return {
			success: true,
			connected: true,
			connection: {
				id: connection.id,
				workspace_id: connection.workspace_id,
				workspace_name: connection.workspace_name,
				team_name: connection.team_name,
				bot_user_id: connection.bot_user_id,
				is_active: connection.is_active,
				connected_at: connection.connected_at,
				last_sync: connection.last_sync,
				// NO incluir access_token por seguridad
			},
		};
	} catch (error) {
		console.error("Error getting Slack status:", error);
		setResponseStatus(event, 500);
		return {
			success: false,
			error:
				error instanceof Error ? error.message : "Unknown error",
		};
	}
});
