@echo off
cls
echo ================================================
echo   SERVIDOR LOCAL - Soft ProConnect Peru SAC
echo ================================================
echo.
echo [OK] Servidor iniciado en: http://localhost:3000/
echo.
echo Credenciales de prueba:
echo   Admin: admin@proconnect.com / admin123
echo   Demo:  demo@proconnect.com / demo123
echo.
echo Paginas disponibles:
echo   - http://localhost:3000/           (Login)
echo   - http://localhost:3000/dashboard  (Dashboard)
echo   - http://localhost:3000/register   (Registro)
echo   - http://localhost:3000/status     (Estado)
echo.
echo Para detener: presiona Ctrl+C
echo.
echo ================================================
echo.

node .output/server/index.mjs
