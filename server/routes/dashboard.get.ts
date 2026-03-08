import { SessionService } from "../lib/auth/session";
import { UserService } from "../lib/auth/users-multi-tenant";

export default defineEventHandler(async (event) => {
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

  // Obtener rol badge
  const getRoleBadge = (role: string) => {
    const badges: Record<string, string> = {
      owner: "👑 Propietario",
      admin: "⚡ Administrador",
      user: "👤 Usuario",
      viewer: "👁️ Visualizador",
    };
    return badges[role] || role;
  };

  // Obtener color del plan
  const getPlanColor = (plan: string) => {
    const colors: Record<string, string> = {
      free: "#718096",
      basic: "#4299e1",
      premium: "#9f7aea",
      enterprise: "#f6ad55",
    };
    return colors[plan] || "#718096";
  };

  return `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dashboard - ${tenant.name}</title>
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
        }

        .navbar-left {
            display: flex;
            align-items: center;
            gap: 15px;
        }

        .company-logo {
            width: 40px;
            height: 40px;
            border-radius: 8px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
            font-size: 1.2rem;
        }

        .navbar h1 {
            font-size: 1.25rem;
            color: #1a202c;
        }

        .plan-badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 12px;
            font-size: 0.75rem;
            font-weight: 600;
            text-transform: uppercase;
            color: white;
            background: ${getPlanColor(tenant.plan)};
        }

        .navbar-right {
            display: flex;
            gap: 20px;
            align-items: center;
        }

        .user-info {
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .avatar {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
        }

        .user-details {
            display: flex;
            flex-direction: column;
        }

        .user-name {
            font-weight: 600;
            color: #1a202c;
        }

        .user-role {
            font-size: 0.75rem;
            color: #718096;
        }

        .btn-logout {
            padding: 8px 16px;
            background: #e53e3e;
            color: white;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-weight: 500;
            transition: background 0.3s;
        }

        .btn-logout:hover {
            background: #c53030;
        }

        .container {
            max-width: 1200px;
            margin: 2rem auto;
            padding: 0 2rem;
        }

        .welcome {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 2.5rem;
            border-radius: 12px;
            box-shadow: 0 10px 25px rgba(102, 126, 234, 0.3);
            margin-bottom: 2rem;
        }

        .welcome h2 {
            font-size: 2.5rem;
            margin-bottom: 0.5rem;
        }

        .welcome p {
            font-size: 1.1rem;
            opacity: 0.95;
        }

        .tenant-info {
            background: white;
            padding: 2rem;
            border-radius: 12px;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            margin-bottom: 2rem;
        }

        .tenant-info h3 {
            font-size: 1.25rem;
            margin-bottom: 1rem;
            color: #1a202c;
        }

        .info-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1rem;
        }

        .info-item {
            display: flex;
            flex-direction: column;
        }

        .info-label {
            font-size: 0.875rem;
            color: #718096;
            margin-bottom: 0.25rem;
        }

        .info-value {
            font-size: 1rem;
            color: #1a202c;
            font-weight: 600;
        }

        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 1.5rem;
            margin-bottom: 2rem;
        }

        .stat-card {
            background: white;
            padding: 1.5rem;
            border-radius: 12px;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            border-left: 4px solid;
            transition: transform 0.3s;
        }

        .stat-card:hover {
            transform: translateY(-5px);
        }

        .stat-card.purple { border-color: #667eea; }
        .stat-card.green { border-color: #48bb78; }
        .stat-card.orange { border-color: #ed8936; }
        .stat-card.blue { border-color: #4299e1; }

        .stat-card h3 {
            color: #718096;
            font-size: 0.875rem;
            font-weight: 500;
            text-transform: uppercase;
            margin-bottom: 0.5rem;
        }

        .stat-card .value {
            font-size: 2rem;
            font-weight: 700;
            color: #1a202c;
        }

        .stat-card .subtext {
            font-size: 0.875rem;
            color: #718096;
            margin-top: 0.5rem;
        }

        .quick-actions {
            background: white;
            padding: 2rem;
            border-radius: 12px;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            margin-bottom: 2rem;
        }

        .quick-actions h3 {
            font-size: 1.25rem;
            margin-bottom: 1.5rem;
            color: #1a202c;
        }

        .actions-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1rem;
        }

        .action-btn {
            padding: 1rem;
            background: #f7fafc;
            border: 2px solid #e2e8f0;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.3s;
            text-align: center;
            color: #1a202c;
            font-weight: 500;
        }

        .action-btn:hover {
            border-color: #667eea;
            background: #edf2f7;
            transform: translateY(-2px);
        }

        .features-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 1.5rem;
        }

        .feature-card {
            background: white;
            padding: 2rem;
            border-radius: 12px;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            transition: transform 0.3s, box-shadow 0.3s;
            cursor: pointer;
        }

        .feature-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
        }

        .feature-icon {
            width: 50px;
            height: 50px;
            border-radius: 10px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 1rem;
        }

        .feature-card h3 {
            font-size: 1.25rem;
            margin-bottom: 0.5rem;
            color: #1a202c;
        }

        .feature-card p {
            color: #718096;
            line-height: 1.6;
        }

        .coming-soon {
            display: inline-block;
            padding: 2px 8px;
            background: #fed7d7;
            color: #c53030;
            border-radius: 4px;
            font-size: 0.75rem;
            font-weight: 600;
            margin-left: 8px;
        }

        @media (max-width: 768px) {
            .container {
                padding: 0 1rem;
            }

            .navbar {
                flex-direction: column;
                gap: 1rem;
            }

            .stats-grid,
            .features-grid,
            .actions-grid {
                grid-template-columns: 1fr;
            }

            .welcome h2 {
                font-size: 1.75rem;
            }
        }
    </style>
</head>
<body>
    <nav class="navbar">
        <div class="navbar-left">
            <div class="company-logo">${tenant.name.charAt(0).toUpperCase()}</div>
            <div>
                <h1>${tenant.name}</h1>
                <span class="plan-badge">${tenant.plan}</span>
            </div>
        </div>
        <div class="navbar-right">
            <div class="user-info">
                <div class="avatar">${safeUser.name.charAt(0).toUpperCase()}</div>
                <div class="user-details">
                    <span class="user-name">${safeUser.name}</span>
                    <span class="user-role">${getRoleBadge(safeUser.role)}</span>
                </div>
            </div>
            <button class="btn-logout" onclick="logout()">Cerrar Sesión</button>
        </div>
    </nav>

    <div class="container">
        <div class="welcome">
            <h2>¡Bienvenido de vuelta, ${safeUser.name.split(" ")[0]}! 👋</h2>
            <p>Panel de control de ${tenant.name} - Gestiona tu agente de IA en Slack</p>
        </div>

        <div class="tenant-info">
            <h3>📊 Información de la Empresa</h3>
            <div class="info-grid">
                <div class="info-item">
                    <span class="info-label">Nombre</span>
                    <span class="info-value">${tenant.name}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Industria</span>
                    <span class="info-value">${tenant.industry || "No especificada"}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Plan Actual</span>
                    <span class="info-value">${tenant.plan.toUpperCase()}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Estado</span>
                    <span class="info-value">${tenant.status === "active" ? "✅ Activo" : tenant.status}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Identificador</span>
                    <span class="info-value">${tenant.slug}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Fecha de Registro</span>
                    <span class="info-value">${new Date(tenant.created_at).toLocaleDateString("es-PE")}</span>
                </div>
            </div>
        </div>

        <div class="quick-actions">
            <h3>⚡ Acciones Rápidas</h3>
            <div class="actions-grid">
                <button class="action-btn" onclick="alert('Próximamente')">🔗 Conectar Slack</button>
                <button class="action-btn" onclick="alert('Próximamente')">⚙️ Configurar Agente</button>
                <button class="action-btn" onclick="alert('Próximamente')">👥 Invitar Usuario</button>
                <button class="action-btn" onclick="alert('Próximamente')">📈 Ver Métricas</button>
            </div>
        </div>

        <div class="stats-grid">
            <div class="stat-card purple">
                <h3>Mensajes del Mes</h3>
                <div class="value">0</div>
                <div class="subtext">Agente aún no configurado</div>
            </div>
            <div class="stat-card green">
                <h3>Conversaciones Activas</h3>
                <div class="value">0</div>
                <div class="subtext">Conecta Slack para iniciar</div>
            </div>
            <div class="stat-card orange">
                <h3>Usuarios</h3>
                <div class="value">1</div>
                <div class="subtext">Tu equipo</div>
            </div>
            <div class="stat-card blue">
                <h3>Herramientas Activas</h3>
                <div class="value">0</div>
                <div class="subtext">Configura tu agente</div>
            </div>
        </div>

        <div class="features-grid">
            <div class="feature-card" onclick="alert('Función próximamente disponible')">
                <div class="feature-icon">
                    <svg width="24" height="24" fill="white" viewBox="0 0 24 24">
                        <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                    </svg>
                </div>
                <h3>Configurar Slack <span class="coming-soon">Próximamente</span></h3>
                <p>Conecta tu workspace de Slack y configura el bot inteligente</p>
            </div>

            <div class="feature-card" onclick="alert('Función próximamente disponible')">
                <div class="feature-icon">
                    <svg width="24" height="24" fill="white" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
                    </svg>
                </div>
                <h3>Personalizar Agente IA <span class="coming-soon">Próximamente</span></h3>
                <p>Ajusta el comportamiento, tono y herramientas de tu agente</p>
            </div>

            <div class="feature-card" onclick="alert('Función próximamente disponible')">
                <div class="feature-icon">
                    <svg width="24" height="24" fill="white" viewBox="0 0 24 24">
                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                    </svg>
                </div>
                <h3>Gestión de Equipo <span class="coming-soon">Próximamente</span></h3>
                <p>Invita usuarios, asigna roles y permisos</p>
            </div>

            <div class="feature-card" onclick="alert('Función próximamente disponible')">
                <div class="feature-icon">
                    <svg width="24" height="24" fill="white" viewBox="0 0 24 24">
                        <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/>
                    </svg>
                </div>
                <h3>Analytics <span class="coming-soon">Próximamente</span></h3>
                <p>Métricas, reportes y análisis de conversaciones</p>
            </div>

            <div class="feature-card" onclick="alert('Función próximamente disponible')">
                <div class="feature-icon">
                    <svg width="24" height="24" fill="white" viewBox="0 0 24 24">
                        <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94L14.4 2.81c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/>
                    </svg>
                </div>
                <h3>Configuración Avanzada <span class="coming-soon">Próximamente</span></h3>
                <p>Integraciones, webhooks, API keys y más</p>
            </div>

            <div class="feature-card" onclick="window.location.href='/status'">
                <div class="feature-icon">
                    <svg width="24" height="24" fill="white" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                </div>
                <h3>Estado del Sistema</h3>
                <p>Ver estado de servicios, uptime y health checks</p>
            </div>
        </div>
    </div>

    <script>
        async function logout() {
            if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
                try {
                    await fetch('/api/auth/logout', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        }
                    });
                } catch (error) {
                    console.error('Error al cerrar sesión:', error);
                }
                window.location.href = '/';
            }
        }

        // Animación suave al cargar
        document.addEventListener('DOMContentLoaded', () => {
            document.body.style.opacity = '0';
            setTimeout(() => {
                document.body.style.transition = 'opacity 0.5s';
                document.body.style.opacity = '1';
            }, 100);
        });
    </script>
</body>
</html>
`;
});
