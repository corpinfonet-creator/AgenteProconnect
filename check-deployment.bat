@echo off
cls
echo ================================================
echo   Verificador de Deployment - Vercel
echo ================================================
echo.
echo Verificando deployment en Vercel...
echo.

curl -s https://agente-proconnect.vercel.app/ | findstr /C:"Soft ProConnect Peru SAC" >nul
if %errorlevel% equ 0 (
    echo [OK] Deployment completado exitosamente!
    echo.
    echo El sitio ya muestra: "Soft ProConnect Peru SAC"
    echo.
    echo Puedes acceder en: https://agente-proconnect.vercel.app/
    echo.
    echo Credenciales de prueba:
    echo   - admin@proconnect.com / admin123
    echo   - demo@proconnect.com / demo123
) else (
    echo [ESPERANDO] El deployment aun no ha terminado.
    echo.
    echo El sitio todavia muestra la version anterior.
    echo.
    echo Esto es normal, puede tomar 2-5 minutos.
    echo.
    echo Verifica el progreso en:
    echo   https://vercel.com/dashboard
)

echo.
echo ================================================
pause
