/**
 * Endpoint para iniciar el flujo OAuth de Slack
 * Redirige al usuario a la página de autorización de Slack
 */

import { SessionService } from "../../../lib/auth/session";

export default defineEventHandler(async (event) => {
	// Verificar que el usuario esté autenticado
	const session = await SessionService.getFromEvent(event);

	if (!session) {
		return sendRedirect(event, "/?error=unauthorized", 302);
	}

	// Verificar que existan las credenciales de Slack
	const clientId = process.env.SLACK_CLIENT_ID;
	const redirectUri = process.env.SLACK_REDIRECT_URI;

	if (!clientId || !redirectUri) {
		console.error("Slack OAuth credentials not configured");
		return sendRedirect(
			event,
			"/dashboard?error=slack_not_configured",
			302,
		);
	}

	// Scopes que necesitamos para el bot
	const scopes = [
		// Bot scopes
		"chat:write", // Enviar mensajes
		"chat:write.public", // Enviar mensajes a canales públicos sin unirse
		"channels:history", // Leer historial de canales públicos
		"channels:read", // Ver información de canales públicos
		"groups:history", // Leer historial de canales privados
		"groups:read", // Ver información de canales privados
		"im:history", // Leer mensajes directos
		"im:read", // Ver información de mensajes directos
		"im:write", // Enviar mensajes directos
		"mpim:history", // Leer mensajes de grupo
		"mpim:read", // Ver información de mensajes de grupo
		"mpim:write", // Enviar mensajes de grupo
		"app_mentions:read", // Leer menciones del bot
		"users:read", // Leer información de usuarios
		"team:read", // Leer información del workspace
	].join(",");

	// User scopes (opcionales, para saber quién instaló)
	const userScopes = ["identity.basic", "identity.email"].join(",");

	// State token para prevenir CSRF
	// En producción, esto debería ser un token random guardado en sesión
	const state = Buffer.from(
		JSON.stringify({
			user_id: session.user_id,
			timestamp: Date.now(),
		}),
	).toString("base64");

	// Construir URL de autorización de Slack
	const authUrl = new URL("https://slack.com/oauth/v2/authorize");
	authUrl.searchParams.set("client_id", clientId);
	authUrl.searchParams.set("scope", scopes);
	authUrl.searchParams.set("user_scope", userScopes);
	authUrl.searchParams.set("redirect_uri", redirectUri);
	authUrl.searchParams.set("state", state);

	console.log("🔗 Redirecting to Slack OAuth:", authUrl.toString());

	// Redirigir a Slack
	return sendRedirect(event, authUrl.toString(), 302);
});
