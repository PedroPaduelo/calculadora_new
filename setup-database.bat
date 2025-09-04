@echo off
echo ========================================
echo   Calculadora HC - Setup Database
echo ========================================
echo.

echo Configurando banco de dados PostgreSQL...
echo.

cd packages\backend

echo [1/4] Gerando cliente Prisma...
call npx prisma generate
if %errorlevel% neq 0 (
    echo Erro ao gerar cliente Prisma
    pause
    exit /b 1
)

echo.
echo [2/4] Executando migracoes...
call npx prisma migrate dev --name init
if %errorlevel% neq 0 (
    echo Erro ao executar migracoes
    echo Verifique se o PostgreSQL esta rodando e as credenciais no .env estao corretas
    pause
    exit /b 1
)

echo.
echo [3/4] Populando banco com dados iniciais...
call npm run db:seed
if %errorlevel% neq 0 (
    echo Erro ao popular banco de dados
    pause
    exit /b 1
)

cd ..\..

echo.
echo ========================================
echo   Database configurado com sucesso!
echo ========================================
echo.
echo Usuarios de teste criados:
echo - admin@calculadora.com / 123456
echo - manager@calculadora.com / 123456  
echo - analyst@calculadora.com / 123456
echo.
echo Execute: start-dev.bat para iniciar os servicos
echo.
pause
