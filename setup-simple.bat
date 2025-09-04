@echo off
echo ========================================
echo    Calculadora HC - Setup Simplificado
echo ========================================
echo.

echo [1/4] Instalando dependencias do shared...
cd packages\shared
call npm install
if %errorlevel% neq 0 (
    echo Erro ao instalar dependencias do shared
    pause
    exit /b 1
)

echo.
echo [2/4] Buildando o shared...
call npm run build
cd ..\..

echo.
echo [3/4] Instalando dependencias do backend...
cd packages\backend
call npm install
if %errorlevel% neq 0 (
    echo Erro ao instalar dependencias do backend
    pause
    exit /b 1
)
cd ..

echo.
echo [4/4] Copiando arquivos de configuracao...
if not exist "backend\.env" (
    copy "backend\.env.example" "backend\.env"
    echo Arquivo .env do backend criado
)

cd ..

echo.
echo ========================================
echo    Setup basico concluido!
echo ========================================
echo.
echo Proximos passos:
echo 1. Configure PostgreSQL local
echo 2. Execute: setup-database.bat  
echo 3. Execute: start-backend.bat
echo.
pause
