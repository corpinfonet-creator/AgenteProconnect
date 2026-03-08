export default defineEventHandler(async () => {
  return `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Regístrate - Soft ProConnect Peru SAC</title>
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
            overflow: hidden;
            max-width: 900px;
            width: 100%;
            display: grid;
            grid-template-columns: 1fr 1fr;
            min-height: 700px;
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
            margin-bottom: 30px;
        }

        .benefits {
            margin-top: 20px;
        }

        .benefit {
            display: flex;
            align-items: center;
            margin-bottom: 15px;
        }

        .benefit svg {
            width: 24px;
            height: 24px;
            margin-right: 12px;
            flex-shrink: 0;
        }

        .right-panel {
            padding: 60px 40px;
            display: flex;
            flex-direction: column;
            justify-content: center;
        }

        .signup-header {
            margin-bottom: 30px;
        }

        .signup-header h2 {
            font-size: 2rem;
            color: #1a202c;
            margin-bottom: 10px;
        }

        .signup-header p {
            color: #718096;
        }

        .form-group {
            margin-bottom: 20px;
        }

        .form-group label {
            display: block;
            margin-bottom: 8px;
            color: #2d3748;
            font-weight: 500;
            font-size: 0.95rem;
        }

        .form-group input,
        .form-group select {
            width: 100%;
            padding: 14px 16px;
            border: 2px solid #e2e8f0;
            border-radius: 10px;
            font-size: 1rem;
            transition: all 0.3s ease;
        }

        .form-group input:focus,
        .form-group select:focus {
            outline: none;
            border-color: #667eea;
            box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .form-group input.error {
            border-color: #e53e3e;
        }

        .error-message {
            color: #e53e3e;
            font-size: 0.875rem;
            margin-top: 5px;
            display: none;
        }

        .form-group input.error + .error-message {
            display: block;
        }

        .help-text {
            font-size: 0.875rem;
            color: #718096;
            margin-top: 5px;
        }

        .slug-preview {
            font-size: 0.875rem;
            color: #4299e1;
            margin-top: 5px;
            font-weight: 500;
        }

        .btn-signup {
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

        .btn-signup:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 25px rgba(102, 126, 234, 0.4);
        }

        .btn-signup:active {
            transform: translateY(0);
        }

        .btn-signup:disabled {
            opacity: 0.6;
            cursor: not-allowed;
            transform: none;
        }

        .login-link {
            text-align: center;
            margin-top: 20px;
            color: #718096;
            font-size: 0.9rem;
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

        .steps {
            display: flex;
            justify-content: space-between;
            margin-bottom: 30px;
        }

        .step {
            flex: 1;
            text-align: center;
            position: relative;
        }

        .step-number {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background: #e2e8f0;
            color: #718096;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            font-weight: 600;
            margin-bottom: 8px;
        }

        .step.active .step-number {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
        }

        .step.completed .step-number {
            background: #48bb78;
            color: white;
        }

        .step-label {
            font-size: 0.875rem;
            color: #718096;
        }

        .step.active .step-label {
            color: #1a202c;
            font-weight: 600;
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
    </style>
</head>
<body>
    <div class="container">
        <div class="left-panel">
            <h1>🚀 Empieza Gratis</h1>
            <p>Crea tu cuenta y ten tu propio Agente de IA en Slack listo en minutos.</p>

            <div class="benefits">
                <div class="benefit">
                    <svg fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                    </svg>
                    <span><strong>14 días gratis</strong> - Sin tarjeta de crédito</span>
                </div>
                <div class="benefit">
                    <svg fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                    </svg>
                    <span><strong>Setup en 5 minutos</strong> - Rápido y fácil</span>
                </div>
                <div class="benefit">
                    <svg fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                    </svg>
                    <span><strong>Personalizable</strong> - Adaptado a tu industria</span>
                </div>
                <div class="benefit">
                    <svg fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                    </svg>
                    <span><strong>Soporte incluido</strong> - Te ayudamos a empezar</span>
                </div>
            </div>
        </div>

        <div class="right-panel">
            <div class="signup-header">
                <h2>Crear Cuenta</h2>
                <p>Regístrate y comienza tu prueba gratuita</p>
            </div>

            <div id="alert" class="alert"></div>

            <form id="signupForm">
                <!-- Paso 1: Información de la Empresa -->
                <div class="form-group">
                    <label for="companyName">Nombre de tu Empresa *</label>
                    <input
                        type="text"
                        id="companyName"
                        name="companyName"
                        placeholder="Ej: Mi Empresa SAC"
                        required
                    >
                    <div class="error-message" id="companyNameError">El nombre de la empresa es requerido</div>
                </div>

                <div class="form-group">
                    <label for="slug">Identificador Único *</label>
                    <input
                        type="text"
                        id="slug"
                        name="slug"
                        placeholder="mi-empresa"
                        pattern="[a-z0-9-]+"
                        required
                    >
                    <div class="slug-preview" id="slugPreview"></div>
                    <div class="help-text">Solo letras minúsculas, números y guiones. Ej: mi-empresa-sac</div>
                    <div class="error-message" id="slugError">El identificador es requerido</div>
                </div>

                <div class="form-group">
                    <label for="industry">Industria / Rubro *</label>
                    <select id="industry" name="industry" required>
                        <option value="">Selecciona tu industria...</option>
                        <option value="inmobiliaria">🏢 Inmobiliaria</option>
                        <option value="clinica">🏥 Clínica / Salud</option>
                        <option value="ferreteria">🔧 Ferretería / Construcción</option>
                        <option value="tienda_ropa">👗 Tienda de Ropa</option>
                        <option value="tecnologia">💻 Tecnología / Software</option>
                        <option value="restaurante">🍽️ Restaurante / Alimentos</option>
                        <option value="educacion">📚 Educación</option>
                        <option value="finanzas">💰 Finanzas / Seguros</option>
                        <option value="turismo">✈️ Turismo / Viajes</option>
                        <option value="otros">🏪 Otros</option>
                    </select>
                </div>

                <!-- Paso 2: Tu Información -->
                <div class="form-group">
                    <label for="name">Tu Nombre Completo *</label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        placeholder="Juan Pérez"
                        required
                    >
                </div>

                <div class="form-group">
                    <label for="email">Correo Electrónico *</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        placeholder="tu@email.com"
                        required
                    >
                    <div class="help-text">Usarás este email para iniciar sesión</div>
                </div>

                <div class="form-group">
                    <label for="password">Contraseña *</label>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        placeholder="Mínimo 8 caracteres"
                        minlength="8"
                        required
                    >
                    <div class="help-text" id="passwordStrength"></div>
                </div>

                <div class="form-group">
                    <label for="confirmPassword">Confirmar Contraseña *</label>
                    <input
                        type="password"
                        id="confirmPassword"
                        name="confirmPassword"
                        placeholder="Repite tu contraseña"
                        required
                    >
                    <div class="error-message" id="confirmPasswordError">Las contraseñas no coinciden</div>
                </div>

                <button type="submit" class="btn-signup" id="submitBtn">
                    Crear Cuenta Gratis 🚀
                </button>
            </form>

            <div class="login-link">
                ¿Ya tienes cuenta? <a href="/">Inicia sesión</a>
            </div>
        </div>
    </div>

    <script>
        const form = document.getElementById('signupForm');
        const companyNameInput = document.getElementById('companyName');
        const slugInput = document.getElementById('slug');
        const slugPreview = document.getElementById('slugPreview');
        const passwordInput = document.getElementById('password');
        const confirmPasswordInput = document.getElementById('confirmPassword');
        const submitBtn = document.getElementById('submitBtn');
        const alert = document.getElementById('alert');

        // Auto-generar slug desde nombre de empresa
        companyNameInput.addEventListener('input', () => {
            const name = companyNameInput.value;
            const autoSlug = name
                .toLowerCase()
                .replace(/[áàäâ]/g, 'a')
                .replace(/[éèëê]/g, 'e')
                .replace(/[íìïî]/g, 'i')
                .replace(/[óòöô]/g, 'o')
                .replace(/[úùüû]/g, 'u')
                .replace(/ñ/g, 'n')
                .replace(/[^a-z0-9\s-]/g, '')
                .replace(/\s+/g, '-')
                .replace(/-+/g, '-')
                .substring(0, 50);

            if (!slugInput.value || slugInput.dataset.auto === 'true') {
                slugInput.value = autoSlug;
                slugInput.dataset.auto = 'true';
            }
        });

        // Actualizar preview del slug
        slugInput.addEventListener('input', () => {
            slugInput.dataset.auto = 'false';
            const value = slugInput.value;
            if (value) {
                slugPreview.textContent = \`Tu URL será: https://\${value}.proconnect.app (o similar)\`;
            } else {
                slugPreview.textContent = '';
            }
        });

        // Validación de fortaleza de contraseña
        passwordInput.addEventListener('input', () => {
            const password = passwordInput.value;
            const strengthText = document.getElementById('passwordStrength');

            if (password.length === 0) {
                strengthText.textContent = '';
                return;
            }

            let strength = 0;
            if (password.length >= 8) strength++;
            if (password.length >= 12) strength++;
            if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
            if (/[0-9]/.test(password)) strength++;
            if (/[^a-zA-Z0-9]/.test(password)) strength++;

            const levels = ['Muy débil', 'Débil', 'Regular', 'Buena', 'Excelente'];
            const colors = ['#e53e3e', '#ed8936', '#ecc94b', '#48bb78', '#38a169'];

            strengthText.textContent = \`Fortaleza: \${levels[strength]}\`;
            strengthText.style.color = colors[strength];
        });

        // Validación de confirmación de contraseña
        confirmPasswordInput.addEventListener('input', () => {
            if (passwordInput.value !== confirmPasswordInput.value) {
                confirmPasswordInput.classList.add('error');
            } else {
                confirmPasswordInput.classList.remove('error');
            }
        });

        // Envío del formulario
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            // Validaciones
            if (passwordInput.value !== confirmPasswordInput.value) {
                showAlert('Las contraseñas no coinciden', 'error');
                return;
            }

            if (passwordInput.value.length < 8) {
                showAlert('La contraseña debe tener al menos 8 caracteres', 'error');
                return;
            }

            // Deshabilitar botón
            submitBtn.disabled = true;
            submitBtn.textContent = 'Creando cuenta...';

            try {
                const response = await fetch('/api/auth/signup', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        companyName: companyNameInput.value,
                        slug: slugInput.value,
                        industry: document.getElementById('industry').value,
                        name: document.getElementById('name').value,
                        email: document.getElementById('email').value,
                        password: passwordInput.value,
                    })
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
                submitBtn.disabled = false;
                submitBtn.textContent = 'Crear Cuenta Gratis 🚀';
            }
        });

        function showAlert(message, type) {
            alert.className = \`alert alert-\${type}\`;
            alert.textContent = message;
            alert.style.display = 'block';

            setTimeout(() => {
                alert.style.display = 'none';
            }, 5000);
        }
    </script>
</body>
</html>
`;
});
