export default defineEventHandler(async () => {
  return `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Registro - Agente Proconnect</title>
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
            max-width: 500px;
            width: 100%;
            padding: 60px 40px;
        }

        .register-header {
            text-align: center;
            margin-bottom: 40px;
        }

        .register-header h1 {
            font-size: 2rem;
            color: #1a202c;
            margin-bottom: 10px;
        }

        .register-header p {
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

        .btn-register {
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

        .btn-register:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 25px rgba(102, 126, 234, 0.4);
        }

        .btn-register:active {
            transform: translateY(0);
        }

        .btn-register:disabled {
            opacity: 0.6;
            cursor: not-allowed;
            transform: none;
        }

        .login-link {
            text-align: center;
            margin-top: 25px;
            color: #718096;
        }

        .login-link a {
            color: #667eea;
            text-decoration: none;
            font-weight: 600;
        }

        .login-link a:hover {
            text-decoration: underline;
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

        .password-strength {
            margin-top: 8px;
            font-size: 0.85rem;
        }

        .strength-bar {
            height: 4px;
            background: #e2e8f0;
            border-radius: 2px;
            margin-top: 5px;
            overflow: hidden;
        }

        .strength-fill {
            height: 100%;
            width: 0%;
            transition: all 0.3s ease;
        }

        .strength-weak { background: #fc8181; width: 33%; }
        .strength-medium { background: #f6ad55; width: 66%; }
        .strength-strong { background: #68d391; width: 100%; }
    </style>
</head>
<body>
    <div class="container">
        <div class="register-header">
            <h1>🚀 Crear Cuenta</h1>
            <p>Únete a Agente Proconnect</p>
        </div>

        <div id="alert" class="alert"></div>

        <form id="registerForm">
            <div class="form-group">
                <label for="name">Nombre completo</label>
                <input
                    type="text"
                    id="name"
                    name="name"
                    placeholder="Juan Pérez"
                    required
                    minlength="2"
                >
            </div>

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
                    minlength="6"
                >
                <div class="password-strength">
                    <div class="strength-bar">
                        <div id="strengthFill" class="strength-fill"></div>
                    </div>
                    <span id="strengthText"></span>
                </div>
            </div>

            <div class="form-group">
                <label for="confirmPassword">Confirmar contraseña</label>
                <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    placeholder="••••••••"
                    required
                    minlength="6"
                >
            </div>

            <button type="submit" class="btn-register">
                Crear Cuenta
            </button>
        </form>

        <div class="login-link">
            ¿Ya tienes cuenta? <a href="/">Inicia sesión</a>
        </div>
    </div>

    <script>
        const form = document.getElementById('registerForm');
        const passwordInput = document.getElementById('password');
        const confirmPasswordInput = document.getElementById('confirmPassword');
        const strengthFill = document.getElementById('strengthFill');
        const strengthText = document.getElementById('strengthText');
        const alert = document.getElementById('alert');

        // Verificar fortaleza de contraseña
        passwordInput.addEventListener('input', (e) => {
            const password = e.target.value;
            let strength = 0;

            if (password.length >= 6) strength++;
            if (password.length >= 10) strength++;
            if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
            if (/\\d/.test(password)) strength++;
            if (/[^a-zA-Z\\d]/.test(password)) strength++;

            strengthFill.className = 'strength-fill';

            if (strength <= 2) {
                strengthFill.classList.add('strength-weak');
                strengthText.textContent = 'Débil';
                strengthText.style.color = '#fc8181';
            } else if (strength <= 3) {
                strengthFill.classList.add('strength-medium');
                strengthText.textContent = 'Media';
                strengthText.style.color = '#f6ad55';
            } else {
                strengthFill.classList.add('strength-strong');
                strengthText.textContent = 'Fuerte';
                strengthText.style.color = '#68d391';
            }
        });

        // Manejar envío del formulario
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const password = passwordInput.value;
            const confirmPassword = confirmPasswordInput.value;

            // Validar que las contraseñas coincidan
            if (password !== confirmPassword) {
                showAlert('Las contraseñas no coinciden', 'error');
                return;
            }

            const submitBtn = form.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Creando cuenta...';
            submitBtn.disabled = true;

            try {
                const response = await fetch('/api/auth/register', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ name, email, password })
                });

                const data = await response.json();

                if (response.ok) {
                    showAlert('¡Cuenta creada exitosamente! Redirigiendo...', 'success');
                    setTimeout(() => {
                        window.location.href = '/dashboard';
                    }, 1500);
                } else {
                    throw new Error(data.message || 'Error al crear cuenta');
                }
            } catch (error) {
                showAlert(error.message, 'error');
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }
        });

        function showAlert(message, type) {
            alert.className = \`alert alert-\${type}\`;
            alert.textContent = message;
            alert.style.display = 'block';
        }
    </script>
</body>
</html>
`;
});
