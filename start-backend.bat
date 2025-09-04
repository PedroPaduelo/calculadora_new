@echo off
echo ========================================
echo   Calculadora HC - Iniciar Backend
echo ========================================
echo.

echo Iniciando backend na porta 3001...
echo Backend: http://localhost:3001
echo.
echo Pressione Ctrl+C para parar o servico
echo.

cd packages\backend
npm run dev
