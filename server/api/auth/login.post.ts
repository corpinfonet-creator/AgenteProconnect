import { UserService } from "../../lib/auth/users-multi-tenant";
import { SessionService } from "../../lib/auth/session";

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { email, password } = body;

    // Validación de campos
    if (!email || !password) {
      throw createError({
        statusCode: 400,
        message: "Email y contraseña son requeridos",
      });
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw createError({
        statusCode: 400,
        message: "Formato de email inválido",
      });
    }

    // Validar credenciales
    const user = await UserService.validateCredentials(email, password);

    if (!user) {
      throw createError({
        statusCode: 401,
        message: "Email o contraseña incorrectos",
      });
    }

    // Crear sesión
    const sessionId = await SessionService.create(user);

    // Establecer cookie de sesión
    SessionService.setSessionCookie(event, sessionId);

    // Retornar usuario sin información sensible
    const safeUser = UserService.getSafeUser(user);

    return {
      success: true,
      message: "Inicio de sesión exitoso",
      user: safeUser,
    };
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || "Error al iniciar sesión",
    });
  }
});
