@echo off
echo ========================================
echo   SERVIDOR LOCAL - Soft ProConnect
echo ========================================
echo.
echo Iniciando servidor de desarrollo...
echo.
echo Una vez iniciado, abre tu navegador en:
echo    http://localhost:3000/
echo.
echo Los cambios se reflejaran INSTANTANEAMENTE
echo.
echo Para detener: presiona Ctrl+C
echo.
echo ========================================
echo.

cd /d %~dp0
npm run dev
