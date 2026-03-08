import { SessionService } from "../../lib/auth/session";
import { UserService } from "../../lib/auth/users";

export default defineEventHandler(async (event) => {
  try {
    // Obtener sesión actual
    const session = SessionService.getFromEvent(event);

    if (!session) {
      throw createError({
        statusCode: 401,
        message: "No autenticado",
      });
    }

    // Buscar usuario completo
    const user = UserService.findById(session.userId);

    if (!user) {
      // Si el usuario no existe, destruir sesión
      SessionService.clearSessionCookie(event);
      throw createError({
        statusCode: 401,
        message: "Usuario no encontrado",
      });
    }

    // Retornar usuario sin información sensible
    const safeUser = UserService.getSafeUser(user);

    return {
      success: true,
      user: safeUser,
      session: {
        createdAt: session.createdAt,
        expiresAt: session.expiresAt,
      },
    };
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || "Error al obtener usuario",
    });
  }
});
