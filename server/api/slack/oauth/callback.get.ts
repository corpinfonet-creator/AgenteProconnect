/**
 * Endpoint de callback OAuth de Slack
 * Procesa el código de autorización y guarda los tokens
 */

import { SessionService } from "../../../lib/auth/session";
import { UserService } from "../../../lib/auth/users-multi-tenant";
import { SlackConnectionService } from "../../../lib/slack/connections";

export default defineEventHandler(async (event) => {
	const query = getQuery(event);

	// Verificar que el usuario esté autenticado
	const session = await SessionService.getFromEvent(event);

	if (!session) {
		console.error("No session found in callback");
		return sendRedirect(event, "/?error=unauthorized", 302);
	}

	// Verificar que tenemos el código
	const code = query.code as string;
	if (!code) {
		console.error("No code in OAuth callback");
		return sendRedirect(event, "/dashboard?error=oauth_failed", 302);
	}

	// Verificar state (prevenir CSRF)
	const state = query.state as string;
	if (state) {
		try {
			const stateData = JSON.parse(
				Buffer.from(state, "base64").toString(),
			);
			if (stateData.user_id !== session.user_id) {
				console.error("State user_id mismatch");
				return sendRedirect(event, "/dashboard?error=invalid_state", 302);
			}
		} catch (error) {
			console.error("Invalid state token:", error);
			return sendRedirect(event, "/dashboard?error=invalid_state", 302);
		}
	}

	// Verificar credenciales
	const clientId = process.env.SLACK_CLIENT_ID;
	const clientSecret = process.env.SLACK_CLIENT_SECRET;
	const redirectUri = process.env.SLACK_REDIRECT_URI;

	if (!clientId || !clientSecret || !redirectUri) {
		console.error("Slack OAuth credentials not configured");
		return sendRedirect(
			event,
			"/dashboard?error=slack_not_configured",
			302,
		);
	}

	try {
		console.log("🔄 Exchanging code for token...");

		// Intercambiar el código por un token de acceso
		const tokenResponse = await fetch(
			"https://slack.com/api/oauth.v2.access",
			{
				method: "POST",
				headers: {
					"Content-Type": "application/x-www-form-urlencoded",
				},
				body: new URLSearchParams({
					client_id: clientId,
					client_secret: clientSecret,
					code: code,
					redirect_uri: redirectUri,
				}),
			},
		);

		const tokenData = await tokenResponse.json();

		if (!tokenData.ok) {
			console.error("Slack OAuth error:", tokenData.error);
			return sendRedirect(
				event,
				`/dashboard?error=slack_error&message=${tokenData.error}`,
				302,
			);
		}

		console.log("✅ Token received from Slack");

		// Obtener información del usuario
		const user = await UserService.findById(session.user_id);
		if (!user || !user.tenant_id) {
			console.error("User or tenant not found");
			return sendRedirect(event, "/dashboard?error=user_not_found", 302);
		}

		// Guardar la conexión en la base de datos
		const connection = await SlackConnectionService.upsert({
			tenant_id: user.tenant_id,
			workspace_id: tokenData.team.id,
			workspace_name: tokenData.team.name,
			access_token: tokenData.access_token,
			bot_user_id: tokenData.bot_user_id,
			scope: tokenData.scope,
			authed_user_id: tokenData.authed_user?.id,
			team_id: tokenData.team.id,
			team_name: tokenData.team.name,
			installation_data: {
				app_id: tokenData.app_id,
				enterprise: tokenData.enterprise,
				is_enterprise_install: tokenData.is_enterprise_install,
				token_type: tokenData.token_type,
				authed_user: tokenData.authed_user,
				incoming_webhook: tokenData.incoming_webhook,
			},
		});

		console.log("✅ Connection saved to database:", connection.id);

		// Redirigir al dashboard con mensaje de éxito
		return sendRedirect(
			event,
			"/dashboard/slack?success=connected",
			302,
		);
	} catch (error) {
		console.error("Error in OAuth callback:", error);
		return sendRedirect(
			event,
			`/dashboard?error=oauth_exception&message=${error instanceof Error ? error.message : "Unknown error"}`,
			302,
		);
	}
});
