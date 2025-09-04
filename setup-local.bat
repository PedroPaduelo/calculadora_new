@echo off
echo ========================================
echo    Calculadora HC - Setup Local
echo ========================================
echo.

echo [1/6] Instalando dependencias do projeto raiz...
call npm install
if %errorlevel% neq 0 (
    echo Erro ao instalar dependencias do projeto raiz
    pause
    exit /b 1
)

echo.
echo [2/6] Instalando dependencias do shared...
cd packages\shared
call npm install
if %errorlevel% neq 0 (
    echo Erro ao instalar dependencias do shared
    pause
    exit /b 1
)

echo.
echo [3/6] Buildando o pacote shared...
call npm run build
cd ..\..

echo.
echo [4/6] Instalando dependencias do backend...
cd packages\backend
call npm install
if %errorlevel% neq 0 (
    echo Erro ao instalar dependencias do backend
    pause
    exit /b 1
)

echo.
echo [5/6] Instalando dependencias do frontend...
cd ..\frontend
call npm install
if %errorlevel% neq 0 (
    echo Erro ao instalar dependencias do frontend
    pause
    exit /b 1
)

cd ..\..

echo.
echo [6/6] Copiando arquivos de configuracao...
if not exist "packages\backend\.env" (
    copy "packages\backend\.env.example" "packages\backend\.env"
    echo Arquivo .env do backend criado
)

if not exist "packages\frontend\.env" (
    copy "packages\frontend\.env.example" "packages\frontend\.env"
    echo Arquivo .env do frontend criado
)

echo.
echo ========================================
echo    Setup concluido com sucesso!
echo ========================================
echo.
echo Proximos passos:
echo 1. Configure seu PostgreSQL local
echo 2. Execute: setup-database.bat
echo 3. Execute: start-dev.bat
echo.
pause
