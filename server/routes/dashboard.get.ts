export default defineEventHandler(async (event) => {
  // Verificar sesión
  const sessionToken = getCookie(event, "session");

  if (!sessionToken) {
    return sendRedirect(event, "/", 302);
  }

  return `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dashboard - Agente Proconnect</title>
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

        .navbar h1 {
            font-size: 1.5rem;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
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
            background: white;
            padding: 2rem;
            border-radius: 12px;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            margin-bottom: 2rem;
        }

        .welcome h2 {
            font-size: 2rem;
            margin-bottom: 0.5rem;
            color: #1a202c;
        }

        .welcome p {
            color: #718096;
            font-size: 1.1rem;
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

        @media (max-width: 768px) {
            .container {
                padding: 0 1rem;
            }

            .stats-grid,
            .features-grid {
                grid-template-columns: 1fr;
            }
        }
    </style>
</head>
<body>
    <nav class="navbar">
        <h1>🚀 Agente Proconnect</h1>
        <div class="navbar-right">
            <div class="user-info">
                <div class="avatar">A</div>
                <span id="userName">Usuario</span>
            </div>
            <button class="btn-logout" onclick="logout()">Cerrar Sesión</button>
        </div>
    </nav>

    <div class="container">
        <div class="welcome">
            <h2>¡Bienvenido de vuelta! 👋</h2>
            <p>Aquí está tu panel de control de Agente Proconnect</p>
        </div>

        <div class="stats-grid">
            <div class="stat-card purple">
                <h3>Mensajes Procesados</h3>
                <div class="value">1,284</div>
            </div>
            <div class="stat-card green">
                <h3>Automatizaciones Activas</h3>
                <div class="value">42</div>
            </div>
            <div class="stat-card orange">
                <h3>Tiempo Ahorrado</h3>
                <div class="value">156h</div>
            </div>
            <div class="stat-card blue">
                <h3>Canales Conectados</h3>
                <div class="value">18</div>
            </div>
        </div>

        <div class="features-grid">
            <div class="feature-card" onclick="alert('Función próximamente disponible')">
                <div class="feature-icon">
                    <svg width="24" height="24" fill="white" viewBox="0 0 24 24">
                        <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                    </svg>
                </div>
                <h3>Gestión de Slack</h3>
                <p>Administra canales, mensajes y automatizaciones de tu workspace de Slack</p>
            </div>

            <div class="feature-card" onclick="alert('Función próximamente disponible')">
                <div class="feature-icon">
                    <svg width="24" height="24" fill="white" viewBox="0 0 24 24">
                        <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/>
                    </svg>
                </div>
                <h3>Análisis y Reportes</h3>
                <p>Visualiza métricas, tendencias y reportes detallados de tu agente IA</p>
            </div>

            <div class="feature-card" onclick="alert('Función próximamente disponible')">
                <div class="feature-icon">
                    <svg width="24" height="24" fill="white" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
                    </svg>
                </div>
                <h3>Configuración de IA</h3>
                <p>Personaliza el comportamiento y respuestas de tu agente inteligente</p>
            </div>

            <div class="feature-card" onclick="alert('Función próximamente disponible')">
                <div class="feature-icon">
                    <svg width="24" height="24" fill="white" viewBox="0 0 24 24">
                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                    </svg>
                </div>
                <h3>Gestión de Usuarios</h3>
                <p>Administra permisos, roles y accesos de tu equipo</p>
            </div>

            <div class="feature-card" onclick="alert('Función próximamente disponible')">
                <div class="feature-icon">
                    <svg width="24" height="24" fill="white" viewBox="0 0 24 24">
                        <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94L14.4 2.81c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/>
                    </svg>
                </div>
                <h3>Configuración</h3>
                <p>Ajusta preferencias generales, integraciones y notificaciones</p>
            </div>

            <div class="feature-card" onclick="window.open('https://github.com/corpinfonet-creator/AgenteProconnect', '_blank')">
                <div class="feature-icon">
                    <svg width="24" height="24" fill="white" viewBox="0 0 24 24">
                        <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
                    </svg>
                </div>
                <h3>Documentación</h3>
                <p>Accede al código fuente y documentación técnica en GitHub</p>
            </div>
        </div>
    </div>

    <script>
        function logout() {
            if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
                document.cookie = 'session=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
                window.location.href = '/';
            }
        }

        // Animación de números
        document.addEventListener('DOMContentLoaded', () => {
            const values = document.querySelectorAll('.value');
            values.forEach(value => {
                const target = value.textContent.replace(/[^0-9]/g, '');
                if (target) {
                    let current = 0;
                    const increment = Math.ceil(target / 50);
                    const timer = setInterval(() => {
                        current += increment;
                        if (current >= target) {
                            current = target;
                            clearInterval(timer);
                        }
                        value.textContent = value.textContent.replace(/[0-9,]+/, current.toLocaleString());
                    }, 30);
                }
            });
        });
    </script>
</body>
</html>
`;
});
