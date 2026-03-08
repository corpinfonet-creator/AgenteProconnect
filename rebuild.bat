@echo off
cls
echo ================================================
echo   REBUILD - Soft ProConnect Peru SAC
echo ================================================
echo.
echo [1/2] Haciendo build del proyecto...
echo.

call npm run build

if %errorlevel% neq 0 (
    echo.
    echo [ERROR] El build fallo. Revisa los errores arriba.
    echo.
    pause
    exit /b 1
)

echo.
echo [2/2] Build completado exitosamente!
echo.
echo ================================================
echo.
echo Ahora puedes:
echo   1. Recargar el navegador (F5)
echo   2. O reiniciar el servidor con: start-server.bat
echo.
echo ================================================
pause
