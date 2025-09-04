@echo off
echo ========================================
echo   Calculadora HC - Iniciar Desenvolvimento
echo ========================================
echo.

echo Iniciando servicos de desenvolvimento...
echo.
echo Backend: http://localhost:3001
echo Frontend: http://localhost:3000
echo.
echo Pressione Ctrl+C para parar os servicos
echo.

start "Backend" cmd /k "cd packages\backend && npm run dev"
start "Frontend" cmd /k "cd packages\frontend && npm run dev"

echo Servicos iniciados em janelas separadas
echo.
pause
