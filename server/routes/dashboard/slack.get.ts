/**
 * Página de configuración de Slack
 * Permite conectar/desconectar workspace y configurar el bot
 */

export default defineEventHandler(async (event) => {
	const { SessionService } = await import("../../lib/auth/session");
	const { UserService } = await import("../../lib/auth/users-multi-tenant");

	// Verificar sesión
	const session = await SessionService.getFromEvent(event);

	if (!session) {
		return sendRedirect(event, "/", 302);
	}

	// Obtener datos del usuario con tenant
	const user = await UserService.findById(session.user_id);

	if (!user || !user.tenant) {
		SessionService.clearSessionCookie(event);
		return sendRedirect(event, "/", 302);
	}

	const safeUser = UserService.getSafeUser(user);
	const tenant = user.tenant;

	// Obtener query params para mensajes
	const query = getQuery(event);
	const success = query.success as string | undefined;
	const error = query.error as string | undefined;

	return `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Configuración de Slack - ${tenant.name}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #f7fafc;
        }

        .navbar {
            background: white;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            padding: 1rem 2rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 2rem;
        }

        .navbar h1 {
            font-size: 1.25rem;
            color: #1a202c;
        }

        .btn-back {
            padding: 8px 16px;
            background: #e2e8f0;
            color: #2d3748;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            text-decoration: none;
            display: inline-block;
        }

        .btn-back:hover {
            background: #cbd5e0;
        }

        .container {
            max-width: 900px;
            margin: 0 auto;
            padding: 0 2rem;
        }

        .alert {
            padding: 1rem 1.5rem;
            border-radius: 8px;
            margin-bottom: 2rem;
            display: none;
        }

        .alert.show {
            display: block;
        }

        .alert-success {
            background: #c6f6d5;
            color: #22543d;
            border: 1px solid #9ae6b4;
        }

        .alert-error {
            background: #fed7d7;
            color: #742a2a;
            border: 1px solid #fc8181;
        }

        .card {
            background: white;
            border-radius: 12px;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            padding: 2rem;
            margin-bottom: 2rem;
        }

        .card h2 {
            font-size: 1.5rem;
            margin-bottom: 1rem;
            color: #1a202c;
        }

        .card p {
            color: #718096;
            line-height: 1.6;
            margin-bottom: 1.5rem;
        }

        .status-badge {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.5rem 1rem;
            border-radius: 8px;
            font-weight: 600;
            margin-bottom: 1.5rem;
        }

        .status-connected {
            background: #c6f6d5;
            color: #22543d;
        }

        .status-disconnected {
            background: #fed7d7;
            color: #742a2a;
        }

        .connection-info {
            background: #f7fafc;
            padding: 1rem;
            border-radius: 8px;
            margin-bottom: 1.5rem;
        }

        .connection-info div {
            display: flex;
            justify-content: space-between;
            padding: 0.5rem 0;
            border-bottom: 1px solid #e2e8f0;
        }

        .connection-info div:last-child {
            border-bottom: none;
        }

        .connection-info label {
            font-weight: 600;
            color: #2d3748;
        }

        .connection-info span {
            color: #718096;
        }

        .btn-primary {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            padding: 12px 24px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            border-radius: 8px;
            font-size: 1rem;
            font-weight: 600;
            cursor: pointer;
            text-decoration: none;
            transition: transform 0.2s;
        }

        .btn-primary:hover {
            transform: translateY(-2px);
        }

        .btn-danger {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            padding: 12px 24px;
            background: #e53e3e;
            color: white;
            border: none;
            border-radius: 8px;
            font-size: 1rem;
            font-weight: 600;
            cursor: pointer;
            transition: background 0.3s;
        }

        .btn-danger:hover {
            background: #c53030;
        }

        .feature-list {
            list-style: none;
            padding: 0;
        }

        .feature-list li {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            padding: 0.75rem 0;
            border-bottom: 1px solid #e2e8f0;
        }

        .feature-list li:last-child {
            border-bottom: none;
        }

        .feature-list li::before {
            content: '✓';
            display: flex;
            align-items: center;
            justify-content: center;
            width: 24px;
            height: 24px;
            background: #48bb78;
            color: white;
            border-radius: 50%;
            font-weight: bold;
        }

        .loading {
            display: none;
            text-align: center;
            padding: 2rem;
        }

        .loading.show {
            display: block;
        }

        .spinner {
            border: 4px solid #e2e8f0;
            border-top: 4px solid #667eea;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            animation: spin 1s linear infinite;
            margin: 0 auto 1rem;
        }

        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    </style>
</head>
<body>
    <nav class="navbar">
        <h1>⚙️ Configuración de Slack</h1>
        <a href="/dashboard" class="btn-back">← Volver al Dashboard</a>
    </nav>

    <div class="container">
        <!-- Alerta de éxito/error -->
        <div id="alert" class="alert ${success ? 'alert-success show' : error ? 'alert-error show' : ''}">
            ${success === 'connected' ? '✅ Workspace conectado exitosamente!' : ''}
            ${error ? `❌ Error: ${error}` : ''}
        </div>

        <!-- Loading -->
        <div id="loading" class="loading">
            <div class="spinner"></div>
            <p>Cargando información de Slack...</p>
        </div>

        <!-- Contenido principal -->
        <div id="content" style="display: none;">
            <!-- Estado de conexión -->
            <div class="card">
                <h2>Estado de Conexión</h2>
                <div id="connection-status"></div>
            </div>

            <!-- Características del bot -->
            <div class="card">
                <h2>🤖 Características del Bot</h2>
                <p>Una vez conectado, tu bot tendrá las siguientes capacidades:</p>
                <ul class="feature-list">
                    <li>Responder automáticamente a mensajes</li>
                    <li>Inteligencia artificial avanzada (GPT-4 o Claude)</li>
                    <li>Personalidad adaptada a tu industria</li>
                    <li>Soporte en múltiples canales</li>
                    <li>Conversaciones con contexto</li>
                    <li>Análisis y métricas en tiempo real</li>
                    <li>Configuración granular del comportamiento</li>
                    <li>Templates especializados por rubro</li>
                </ul>
            </div>

            <!-- Próximos pasos -->
            <div class="card" id="next-steps" style="display: none;">
                <h2>📋 Próximos Pasos</h2>
                <p>Ya tienes tu workspace conectado. Ahora puedes:</p>
                <ol style="padding-left: 1.5rem; color: #2d3748;">
                    <li style="margin-bottom: 0.5rem;">Personalizar la configuración del bot</li>
                    <li style="margin-bottom: 0.5rem;">Configurar el modelo de IA</li>
                    <li style="margin-bottom: 0.5rem;">Ajustar el prompt del sistema</li>
                    <li style="margin-bottom: 0.5rem;">Definir canales permitidos</li>
                    <li style="margin-bottom: 0.5rem;">¡Comenzar a chatear con tu bot!</li>
                </ol>
                <br>
                <a href="/dashboard/slack/config" class="btn-primary" style="display: inline-block; text-align: center;">
                    ⚙️ Ir a Configuración
                </a>
            </div>
        </div>
    </div>

    <script>
        let connectionData = null;

        async function loadSlackStatus() {
            const loading = document.getElementById('loading');
            const content = document.getElementById('content');
            const statusDiv = document.getElementById('connection-status');
            const nextSteps = document.getElementById('next-steps');

            loading.classList.add('show');

            try {
                const response = await fetch('/api/slack/status');
                const data = await response.json();

                if (!data.success) {
                    throw new Error(data.error || 'Error al cargar estado');
                }

                connectionData = data;

                if (data.connected && data.connection) {
                    // Mostrar estado conectado
                    statusDiv.innerHTML = \`
                        <div class="status-badge status-connected">
                            ✅ Conectado
                        </div>
                        <div class="connection-info">
                            <div>
                                <label>Workspace:</label>
                                <span>\${data.connection.workspace_name || data.connection.team_name}</span>
                            </div>
                            <div>
                                <label>Workspace ID:</label>
                                <span>\${data.connection.workspace_id}</span>
                            </div>
                            <div>
                                <label>Bot User ID:</label>
                                <span>\${data.connection.bot_user_id}</span>
                            </div>
                            <div>
                                <label>Conectado desde:</label>
                                <span>\${new Date(data.connection.connected_at).toLocaleString('es-PE')}</span>
                            </div>
                        </div>
                        <button class="btn-danger" onclick="disconnectSlack()">
                            🔌 Desconectar Workspace
                        </button>
                    \`;

                    nextSteps.style.display = 'block';
                } else {
                    // Mostrar estado desconectado
                    statusDiv.innerHTML = \`
                        <div class="status-badge status-disconnected">
                            ❌ No Conectado
                        </div>
                        <p>Conecta tu workspace de Slack para comenzar a usar tu bot de IA.</p>
                        <a href="/api/slack/oauth/start" class="btn-primary">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M6 15a2 2 0 0 1-2 2a2 2 0 0 1-2-2a2 2 0 0 1 2-2h2v2zm1 0a2 2 0 0 1 2-2a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2a2 2 0 0 1-2-2v-5z"/>
                                <path d="M9 6a2 2 0 0 1-2-2a2 2 0 0 1 2-2a2 2 0 0 1 2 2v2H9zm0 1a2 2 0 0 1 2 2a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2a2 2 0 0 1 2-2h5z"/>
                                <path d="M18 9a2 2 0 0 1 2-2a2 2 0 0 1 2 2a2 2 0 0 1-2 2h-2V9zm-1 0a2 2 0 0 1-2 2a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2a2 2 0 0 1 2 2v5z"/>
                                <path d="M15 18a2 2 0 0 1 2 2a2 2 0 0 1-2 2a2 2 0 0 1-2-2v-2h2zm0-1a2 2 0 0 1-2-2a2 2 0 0 1 2-2h5a2 2 0 0 1 2 2a2 2 0 0 1-2 2h-5z"/>
                            </svg>
                            Conectar con Slack
                        </a>
                    \`;
                }

                loading.classList.remove('show');
                content.style.display = 'block';
            } catch (error) {
                console.error('Error:', error);
                loading.innerHTML = \`
                    <p style="color: #e53e3e;">❌ Error al cargar información: \${error.message}</p>
                \`;
            }
        }

        async function disconnectSlack() {
            if (!confirm('¿Estás seguro de que quieres desconectar tu workspace de Slack?')) {
                return;
            }

            try {
                const response = await fetch('/api/slack/disconnect', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    }
                });

                const data = await response.json();

                if (data.success) {
                    window.location.href = '/dashboard/slack?success=disconnected';
                } else {
                    alert('Error al desconectar: ' + data.error);
                }
            } catch (error) {
                console.error('Error:', error);
                alert('Error al desconectar workspace');
            }
        }

        // Cargar estado al cargar la página
        loadSlackStatus();
    </script>
</body>
</html>
`;
});
