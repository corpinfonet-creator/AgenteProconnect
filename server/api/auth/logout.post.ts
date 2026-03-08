import { SessionService } from "../../lib/auth/session";

export default defineEventHandler(async (event) => {
  try {
    const sessionId = getCookie(event, "session");

    if (sessionId) {
      // Destruir sesión del servidor
      await SessionService.destroy(sessionId);
    }

    // Eliminar cookie
    SessionService.clearSessionCookie(event);

    return {
      success: true,
      message: "Sesión cerrada exitosamente",
    };
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || "Error al cerrar sesión",
    });
  }
});
