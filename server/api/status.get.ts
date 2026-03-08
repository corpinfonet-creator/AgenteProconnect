export default defineEventHandler(async (event) => {
  // Verificar si POSTGRES_URL está configurado
  const hasPostgresUrl = !!process.env.POSTGRES_URL;

  // Información del sistema
  const info = {
    status: "ok",
    database: {
      postgres_url_configured: hasPostgresUrl,
      type: hasPostgresUrl ? "Neon PostgreSQL" : "In-Memory (Temporal)",
      status: hasPostgresUrl
        ? "✅ Conectado"
        : "⚠️ Modo fallback (sin persistencia)",
      message: hasPostgresUrl
        ? "Base de datos configurada correctamente"
        : "Agrega POSTGRES_URL en Vercel para activar la base de datos",
    },
    environment: {
      node_env: process.env.NODE_ENV || "development",
      platform: process.platform,
      timestamp: new Date().toISOString(),
    },
    instructions: hasPostgresUrl
      ? "La base de datos está activa. Los datos son persistentes."
      : "Ve a Vercel Dashboard → Storage → Create Database → Neon Postgres",
  };

  // Headers para permitir CORS
  setResponseHeaders(event, {
    "Content-Type": "application/json",
    "Cache-Control": "no-cache",
  });

  return info;
});
