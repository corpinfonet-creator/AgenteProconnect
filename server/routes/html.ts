export const html = `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Agente Proconnect - Sistema de Gestión</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
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
            overflow: hidden;
            max-width: 1000px;
            width: 100%;
            display: grid;
            grid-template-columns: 1fr 1fr;
            min-height: 600px;
        }

        .left-panel {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 60px 40px;
            display: flex;
            flex-direction: column;
            justify-content: center;
        }

        .left-panel h1 {
            font-size: 2.5rem;
            margin-bottom: 20px;
            font-weight: 700;
        }

        .left-panel p {
            font-size: 1.1rem;
            line-height: 1.8;
            opacity: 0.95;
        }

        .features {
            margin-top: 40px;
        }

        .feature {
            display: flex;
            align-items: center;
            margin-bottom: 15px;
        }

        .feature svg {
            width: 24px;
            height: 24px;
            margin-right: 12px;
        }

        .right-panel {
            padding: 60px 40px;
            display: flex;
            flex-direction: column;
            justify-content: center;
        }

        .login-header {
            margin-bottom: 40px;
        }

        .login-header h2 {
            font-size: 2rem;
            color: #1a202c;
            margin-bottom: 10px;
        }

        .login-header p {
            color: #718096;
        }

        .form-group {
            margin-bottom: 25px;
        }

        .form-group label {
            display: block;
            margin-bottom: 8px;
            color: #2d3748;
            font-weight: 500;
            font-size: 0.95rem;
        }

        .form-group input {
            width: 100%;
            padding: 14px 16px;
            border: 2px solid #e2e8f0;
            border-radius: 10px;
            font-size: 1rem;
            transition: all 0.3s ease;
        }

        .form-group input:focus {
            outline: none;
            border-color: #667eea;
            box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .btn-login {
            width: 100%;
            padding: 16px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            border-radius: 10px;
            font-size: 1.1rem;
            font-weight: 600;
            cursor: pointer;
            transition: transform 0.2s ease, box-shadow 0.2s ease;
            margin-top: 10px;
        }

        .btn-login:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 25px rgba(102, 126, 234, 0.4);
        }

        .btn-login:active {
            transform: translateY(0);
        }

        .forgot-password {
            text-align: center;
            margin-top: 20px;
        }

        .forgot-password a {
            color: #667eea;
            text-decoration: none;
            font-size: 0.9rem;
        }

        .forgot-password a:hover {
            text-decoration: underline;
        }

        .divider {
            display: flex;
            align-items: center;
            margin: 30px 0;
            color: #a0aec0;
            font-size: 0.9rem;
        }

        .divider::before,
        .divider::after {
            content: '';
            flex: 1;
            border-bottom: 1px solid #e2e8f0;
        }

        .divider span {
            padding: 0 15px;
        }

        .social-login {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
        }

        .btn-social {
            padding: 12px;
            border: 2px solid #e2e8f0;
            background: white;
            border-radius: 10px;
            cursor: pointer;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            font-weight: 500;
            color: #2d3748;
        }

        .btn-social:hover {
            border-color: #667eea;
            background: #f7fafc;
        }

        @media (max-width: 768px) {
            .container {
                grid-template-columns: 1fr;
            }

            .left-panel {
                display: none;
            }

            .right-panel {
                padding: 40px 30px;
            }
        }

        .alert {
            padding: 12px 16px;
            border-radius: 8px;
            margin-bottom: 20px;
            display: none;
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
    </style>
</head>
<body>
    <div class="container">
        <div class="left-panel">
            <h1>🚀 Agente Proconnect</h1>
            <p>Sistema inteligente de gestión empresarial con integración a Slack y tecnología de IA avanzada.</p>

            <div class="features">
                <div class="feature">
                    <svg fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                    </svg>
                    <span>Integración completa con Slack</span>
                </div>
                <div class="feature">
                    <svg fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                    </svg>
                    <span>IA y automatización inteligente</span>
                </div>
                <div class="feature">
                    <svg fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                    </svg>
                    <span>Dashboard en tiempo real</span>
                </div>
                <div class="feature">
                    <svg fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                    </svg>
                    <span>Seguridad empresarial</span>
                </div>
            </div>
        </div>

        <div class="right-panel">
            <div class="login-header">
                <h2>Iniciar Sesión</h2>
                <p>Accede a tu panel de control</p>
            </div>

            <div id="alert" class="alert"></div>

            <form id="loginForm">
                <div class="form-group">
                    <label for="email">Correo electrónico</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        placeholder="tu@email.com"
                        required
                    >
                </div>

                <div class="form-group">
                    <label for="password">Contraseña</label>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        placeholder="••••••••"
                        required
                    >
                </div>

                <button type="submit" class="btn-login">
                    Iniciar Sesión
                </button>
            </form>

            <div class="forgot-password">
                <a href="/forgot-password">¿Olvidaste tu contraseña?</a>
            </div>

            <div style="text-align: center; margin-top: 20px; color: #718096;">
                ¿No tienes cuenta? <a href="/register" style="color: #667eea; text-decoration: none; font-weight: 600;">Regístrate</a>
            </div>

            <div class="divider">
                <span>o continuar con</span>
            </div>

            <div class="social-login">
                <button class="btn-social" onclick="loginWithGoogle()">
                    <svg width="20" height="20" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Google
                </button>
                <button class="btn-social" onclick="loginWithSlack()">
                    <svg width="20" height="20" viewBox="0 0 24 24">
                        <path fill="#E01E5A" d="M6 15a2 2 0 0 1-2 2a2 2 0 0 1-2-2a2 2 0 0 1 2-2h2v2zm1 0a2 2 0 0 1 2-2a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2a2 2 0 0 1-2-2v-5z"/>
                        <path fill="#36C5F0" d="M9 6a2 2 0 0 1-2-2a2 2 0 0 1 2-2a2 2 0 0 1 2 2v2H9zm0 1a2 2 0 0 1 2 2a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2a2 2 0 0 1 2-2h5z"/>
                        <path fill="#2EB67D" d="M18 9a2 2 0 0 1 2-2a2 2 0 0 1 2 2a2 2 0 0 1-2 2h-2V9zm-1 0a2 2 0 0 1-2 2a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2a2 2 0 0 1 2 2v5z"/>
                        <path fill="#ECB22E" d="M15 18a2 2 0 0 1 2 2a2 2 0 0 1-2 2a2 2 0 0 1-2-2v-2h2zm0-1a2 2 0 0 1-2-2a2 2 0 0 1 2-2h5a2 2 0 0 1 2 2a2 2 0 0 1-2 2h-5z"/>
                    </svg>
                    Slack
                </button>
            </div>
        </div>
    </div>

    <script>
        document.getElementById('loginForm').addEventListener('submit', async (e) => {
            e.preventDefault();

            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const alert = document.getElementById('alert');

            // Mostrar loading
            const submitBtn = e.target.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Iniciando sesión...';
            submitBtn.disabled = true;

            try {
                const response = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ email, password })
                });

                const data = await response.json();

                if (response.ok) {
                    alert.className = 'alert alert-success';
                    alert.textContent = '¡Inicio de sesión exitoso! Redirigiendo...';
                    alert.style.display = 'block';

                    setTimeout(() => {
                        window.location.href = '/dashboard';
                    }, 1000);
                } else {
                    throw new Error(data.message || 'Error al iniciar sesión');
                }
            } catch (error) {
                alert.className = 'alert alert-error';
                alert.textContent = error.message;
                alert.style.display = 'block';

                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }
        });

        function loginWithGoogle() {
            alert('Función de login con Google próximamente disponible');
        }

        function loginWithSlack() {
            window.location.href = '/api/auth/slack';
        }
    </script>
</body>
</html>
`;
