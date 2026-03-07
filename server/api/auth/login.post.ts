export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { email, password } = body;

    // Validación básica
    if (!email || !password) {
      throw createError({
        statusCode: 400,
        message: "Email y contraseña son requeridos",
      });
    }

    // TODO: Aquí integrarás con tu base de datos real
    // Por ahora, usamos credenciales de demo
    const DEMO_USERS = [
      {
        email: "admin@proconnect.com",
        password: "admin123",
        name: "Administrador",
        role: "admin",
      },
      {
        email: "demo@proconnect.com",
        password: "demo123",
        name: "Usuario Demo",
        role: "user",
      },
    ];

    const user = DEMO_USERS.find(
      (u) => u.email === email && u.password === password,
    );

    if (!user) {
      throw createError({
        statusCode: 401,
        message: "Credenciales inválidas",
      });
    }

    // Crear sesión simple (en producción usar JWT o cookies seguras)
    const session = {
      user: {
        email: user.email,
        name: user.name,
        role: user.role,
      },
      token: Buffer.from(`${user.email}:${Date.now()}`).toString("base64"),
    };

    // Establecer cookie de sesión
    setCookie(event, "session", session.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 7 días
      path: "/",
    });

    return {
      success: true,
      message: "Inicio de sesión exitoso",
      user: session.user,
    };
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || "Error al iniciar sesión",
    });
  }
});
