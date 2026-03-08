export default defineEventHandler(async (event) => {
  const hasPostgresUrl = !!process.env.POSTGRES_URL;
  const dbStatus = hasPostgresUrl;

  return `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Estado del Sistema - Soft ProConnect Peru SAC</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }

        .container {
            background: white;
            border-radius: 20px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            max-width: 800px;
            width: 100%;
            padding: 40px;
        }

        h1 {
            font-size: 2rem;
            margin-bottom: 10px;
            color: #1a202c;
        }

        .subtitle {
            color: #718096;
            margin-bottom: 30px;
        }

        .status-card {
            background: #f7fafc;
            border-radius: 12px;
            padding: 20px;
            margin-bottom: 20px;
            border-left: 4px solid;
        }

        .status-card.success {
            border-color: #48bb78;
        }

        .status-card.warning {
            border-color: #ed8936;
        }

        .status-card.error {
            border-color: #f56565;
        }

        .status-header {
            display: flex;
            align-items: center;
            gap: 10px;
            margin-bottom: 10px;
        }

        .status-icon {
            font-size: 1.5rem;
        }

        .status-title {
            font-size: 1.25rem;
            font-weight: 600;
            color: #1a202c;
        }

        .status-detail {
            color: #4a5568;
            margin: 5px 0;
            padding-left: 35px;
        }

        .code-block {
            background: #2d3748;
            color: #e2e8f0;
            padding: 15px;
            border-radius: 8px;
            font-family: 'Courier New', monospace;
            font-size: 0.9rem;
            overflow-x: auto;
            margin: 10px 0;
        }

        .action-steps {
            background: #edf2f7;
            border-radius: 12px;
            padding: 20px;
            margin-top: 20px;
        }

        .action-steps h3 {
            color: #2d3748;
            margin-bottom: 15px;
        }

        .action-steps ol {
            padding-left: 20px;
        }

        .action-steps li {
            margin-bottom: 10px;
            color: #4a5568;
        }

        .btn {
            display: inline-block;
            padding: 12px 24px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            margin-top: 20px;
            transition: transform 0.2s;
        }

        .btn:hover {
            transform: translateY(-2px);
        }

        .refresh-btn {
            background: #48bb78;
            border: none;
            cursor: pointer;
        }

        .info-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
            margin-top: 20px;
        }

        .info-item {
            background: white;
            padding: 15px;
            border-radius: 8px;
            border: 1px solid #e2e8f0;
        }

        .info-label {
            font-size: 0.875rem;
            color: #718096;
            margin-bottom: 5px;
        }

        .info-value {
            font-size: 1.125rem;
            font-weight: 600;
            color: #2d3748;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>📊 Estado del Sistema</h1>
        <p class="subtitle">Información sobre la configuración y conexión de la base de datos</p>

        <div class="status-card ${dbStatus ? "success" : "warning"}">
            <div class="status-header">
                <span class="status-icon">${dbStatus ? "✅" : "⚠️"}</span>
                <h2 class="status-title">Base de Datos</h2>
            </div>
            <div class="status-detail">
                <strong>Estado:</strong> ${dbStatus ? "Conectado a Neon PostgreSQL" : "Modo In-Memory (Temporal)"}
            </div>
            <div class="status-detail">
                <strong>Variable POSTGRES_URL:</strong> ${hasPostgresUrl ? "✅ Configurada" : "❌ No configurada"}
            </div>
            <div class="status-detail">
                <strong>Persistencia:</strong> ${dbStatus ? "✅ Datos permanentes" : "⚠️ Datos temporales (se borran al reiniciar)"}
            </div>
        </div>

        <div class="info-grid">
            <div class="info-item">
                <div class="info-label">Entorno</div>
                <div class="info-value">${process.env.NODE_ENV || "development"}</div>
            </div>
            <div class="info-item">
                <div class="info-label">Plataforma</div>
                <div class="info-value">${process.platform}</div>
            </div>
            <div class="info-item">
                <div class="info-label">Tipo de BD</div>
                <div class="info-value">${dbStatus ? "PostgreSQL" : "Memoria"}</div>
            </div>
        </div>

        ${
          !dbStatus
            ? `
        <div class="action-steps">
            <h3>🔧 Cómo activar la base de datos PostgreSQL</h3>
            <ol>
                <li>Ve a <strong>Vercel Dashboard</strong> → Tu proyecto</li>
                <li>Click en <strong>"Storage"</strong> en el menú lateral</li>
                <li>Click en <strong>"Create Database"</strong></li>
                <li>Selecciona <strong>"Neon Postgres"</strong></li>
                <li>Click en <strong>"Create"</strong></li>
                <li>Vercel configurará automáticamente la variable <code>POSTGRES_URL</code></li>
                <li>Haz <strong>"Redeploy"</strong> de tu aplicación</li>
            </ol>

            <div class="code-block">
# O configura manualmente en .env (desarrollo local):
POSTGRES_URL=postgresql://user:password@host/database?sslmode=require
            </div>

            <a href="https://vercel.com/dashboard" class="btn" target="_blank">
                Ir a Vercel Dashboard
            </a>
        </div>
        `
            : `
        <div class="status-card success">
            <div class="status-header">
                <span class="status-icon">🎉</span>
                <h2 class="status-title">¡Base de datos activa!</h2>
            </div>
            <div class="status-detail">
                Tu aplicación está conectada a Neon PostgreSQL. Todos los datos son persistentes.
            </div>
        </div>
        `
        }

        <div style="text-align: center; margin-top: 30px;">
            <button class="btn refresh-btn" onclick="location.reload()">
                🔄 Refrescar Estado
            </button>
            <a href="/" class="btn">
                🏠 Ir al Login
            </a>
            <a href="/dashboard" class="btn">
                📊 Ir al Dashboard
            </a>
        </div>

        <div style="margin-top: 30px; padding: 20px; background: #edf2f7; border-radius: 8px;">
            <h3 style="margin-bottom: 10px; color: #2d3748;">📖 Documentación</h3>
            <p style="color: #4a5568; margin-bottom: 10px;">
                Lee <strong>DATABASE_SETUP.md</strong> en el repositorio para instrucciones detalladas.
            </p>
            <a href="https://github.com/corpinfonet-creator/AgenteProconnect" target="_blank" class="btn">
                Ver en GitHub
            </a>
        </div>
    </div>

    <script>
        // Auto-refresh cada 10 segundos
        setTimeout(() => {
            location.reload();
        }, 10000);
    </script>
</body>
</html>
`;
});
