import {
  UserService,
  TenantService,
} from "../../lib/auth/users-multi-tenant";
import { SessionService } from "../../lib/auth/session";

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { companyName, slug, industry, name, email, password } = body;

    // Validación de campos requeridos
    if (!companyName || !slug || !name || !email || !password) {
      throw createError({
        statusCode: 400,
        message: "Todos los campos son requeridos",
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

    // Validar formato de slug
    const slugRegex = /^[a-z0-9-]+$/;
    if (!slugRegex.test(slug)) {
      throw createError({
        statusCode: 400,
        message:
          "El identificador solo puede contener letras minúsculas, números y guiones",
      });
    }

    // Validar longitud de contraseña
    if (password.length < 8) {
      throw createError({
        statusCode: 400,
        message: "La contraseña debe tener al menos 8 caracteres",
      });
    }

    // Verificar que el slug esté disponible
    const isSlugAvailable = await TenantService.isSlugAvailable(slug);
    if (!isSlugAvailable) {
      throw createError({
        statusCode: 400,
        message:
          "Ese identificador ya está en uso. Por favor elige otro.",
      });
    }

    // Verificar que el email no esté registrado
    const existingUser = await UserService.findByEmail(email);
    if (existingUser) {
      throw createError({
        statusCode: 400,
        message: "Ya existe una cuenta con ese correo electrónico",
      });
    }

    // Crear el tenant (empresa)
    const tenant = await TenantService.create({
      name: companyName,
      slug: slug,
      industry: industry || undefined,
      plan: "free", // Plan inicial gratis
      contact_email: email,
    });

    if (!tenant) {
      throw createError({
        statusCode: 500,
        message: "Error al crear la empresa. Por favor intenta de nuevo.",
      });
    }

    // Crear el usuario owner
    const user = await UserService.create({
      tenant_id: tenant.id,
      email: email,
      password: password,
      name: name,
      role: "owner", // El primer usuario es owner
    });

    if (!user) {
      throw createError({
        statusCode: 500,
        message: "Error al crear el usuario. Por favor intenta de nuevo.",
      });
    }

    // Crear sesión automáticamente (auto-login)
    const sessionId = await SessionService.create(user);
    SessionService.setSessionCookie(event, sessionId);

    // Log de actividad
    console.log(`✅ Nueva empresa registrada: ${tenant.name} (${tenant.slug})`);
    console.log(`   Usuario owner: ${user.name} (${user.email})`);

    // Retornar respuesta exitosa
    return {
      success: true,
      message: "Cuenta creada exitosamente",
      tenant: {
        id: tenant.id,
        name: tenant.name,
        slug: tenant.slug,
        plan: tenant.plan,
      },
      user: UserService.getSafeUser(user),
    };
  } catch (error: any) {
    // Si es un error conocido, retornarlo
    if (error.statusCode) {
      throw error;
    }

    // Error desconocido
    console.error("Error en signup:", error);
    throw createError({
      statusCode: 500,
      message: "Error al crear la cuenta. Por favor intenta de nuevo.",
    });
  }
});
