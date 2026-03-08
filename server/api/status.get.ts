import { isDatabaseAvailable } from "../lib/db/client";
import { UserService } from "../lib/auth/users";

export default defineEventHandler(async (event) => {
  const dbStatus = isDatabaseAvailable();

  // Información del sistema
  const info = {
    database: {
      connected: dbStatus,
      type: dbStatus ? "Neon PostgreSQL" : "In-Memory (Temporal)",
      status: dbStatus ? "✅ Conectado" : "⚠️ Modo fallback (sin persistencia)",
      url: process.env.POSTGRES_URL
        ? "Configurado ✅"
        : "❌ No configurado (agrega POSTGRES_URL)",
    },
    environment: {
      node_env: process.env.NODE_ENV || "development",
      platform: process.platform,
    },
    users: {
      count: 0,
      demo_available: true,
    },
  };

  try {
    // Intentar contar usuarios
    const users = await UserService.getAll();
    info.users.count = users.length;
  } catch (error) {
    info.users.count = -1;
  }

  // Headers para permitir CORS
  setResponseHeaders(event, {
    "Content-Type": "application/json",
    "Cache-Control": "no-cache",
  });

  return info;
});
