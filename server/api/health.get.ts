// Endpoint simple de health check
export default defineEventHandler(() => {
  return {
    status: "ok",
    timestamp: new Date().toISOString(),
    message: "Servidor funcionando correctamente",
    database: process.env.POSTGRES_URL ? "configurado" : "no configurado",
  };
});
