/**
 * Endpoint para desconectar un workspace de Slack
 */

import { SessionService } from "../../lib/auth/session";
import { UserService } from "../../lib/auth/users-multi-tenant";
import { SlackConnectionService } from "../../lib/slack/connections";

export default defineEventHandler(async (event) => {
	// Verificar autenticación
	const session = await SessionService.getFromEvent(event);

	if (!session) {
		return {
			success: false,
			error: "Unauthorized",
		};
	}

	try {
		// Obtener usuario y tenant
		const user = await UserService.findById(session.user_id);
		if (!user || !user.tenant_id) {
			return {
				success: false,
				error: "User or tenant not found",
			};
		}

		// Verificar que sea owner o admin
		if (user.role !== "owner" && user.role !== "admin") {
			return {
				success: false,
				error: "Insufficient permissions",
			};
		}

		// Desconectar
		const disconnected =
			await SlackConnectionService.disconnect(user.tenant_id);

		if (!disconnected) {
			return {
				success: false,
				error: "No active connection found",
			};
		}

		console.log(
			`✅ Slack disconnected for tenant: ${user.tenant_id}`,
		);

		return {
			success: true,
			message: "Workspace disconnected successfully",
		};
	} catch (error) {
		console.error("Error disconnecting Slack:", error);
		return {
			success: false,
			error:
				error instanceof Error ? error.message : "Unknown error",
		};
	}
});
