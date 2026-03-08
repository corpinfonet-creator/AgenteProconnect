import { UserService } from "../../lib/auth/users";
import { SessionService } from "../../lib/auth/session";

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { email, password, name } = body;

    // Validación de campos
    if (!email || !password || !name) {
      throw createError({
        statusCode: 400,
        message: "Email, contraseña y nombre son requeridos",
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

    // Validar longitud de contraseña
    if (password.length < 6) {
      throw createError({
        statusCode: 400,
        message: "La contraseña debe tener al menos 6 caracteres",
      });
    }

    // Validar longitud del nombre
    if (name.length < 2) {
      throw createError({
        statusCode: 400,
        message: "El nombre debe tener al menos 2 caracteres",
      });
    }

    // Verificar si el usuario ya existe
    const existingUser = UserService.findByEmail(email);
    if (existingUser) {
      throw createError({
        statusCode: 409,
        message: "El email ya está registrado",
      });
    }

    // Crear nuevo usuario
    // TODO: En producción, hashear la contraseña con bcrypt
    const newUser = UserService.create({
      email: email.toLowerCase().trim(),
      password, // TODO: hashear
      name: name.trim(),
      role: "user", // Por defecto, rol de usuario
    });

    // Crear sesión automáticamente
    const sessionId = SessionService.create(newUser);
    SessionService.setSessionCookie(event, sessionId);

    // Retornar usuario sin información sensible
    const safeUser = UserService.getSafeUser(newUser);

    return {
      success: true,
      message: "Usuario registrado exitosamente",
      user: safeUser,
    };
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || "Error al registrar usuario",
    });
  }
});
