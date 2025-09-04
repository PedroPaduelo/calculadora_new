# Setup Local - Calculadora HC

Guia para executar o projeto localmente sem Docker.

## 📋 Pré-requisitos

### 1. Node.js
- Node.js 18+ 
- npm 9+

### 2. PostgreSQL
- PostgreSQL 12+ instalado localmente
- Usuário com permissões para criar databases

### 3. Git
- Git instalado

## 🚀 Setup Passo a Passo

### 1. Clone e Instale Dependências
```bash
# Clone o repositório
git clone <repository-url>
cd calculadora

# Instale todas as dependências do monorepo
npm install
```

### 2. Configure PostgreSQL
```bash
# Conecte ao PostgreSQL como superuser
psql -U postgres

# Crie o database
CREATE DATABASE calculadora_hc;

# Crie um usuário (opcional)
CREATE USER calculadora_user WITH PASSWORD 'calculadora123';
GRANT ALL PRIVILEGES ON DATABASE calculadora_hc TO calculadora_user;

# Saia do psql
\q
```

### 3. Configure Variáveis de Ambiente

#### Backend (.env)
```bash
# Copie o arquivo de exemplo
cp packages/backend/.env.example packages/backend/.env

# Edite o arquivo packages/backend/.env com suas configurações:
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/calculadora_hc"
JWT_SECRET="calculadora-hc-jwt-secret-key-development"
JWT_REFRESH_SECRET="calculadora-hc-refresh-secret-key-development"
PORT=3001
NODE_ENV=development
CORS_ORIGIN="http://localhost:3000"
```

#### Frontend (.env)
```bash
# Copie o arquivo de exemplo
cp packages/frontend/.env.example packages/frontend/.env

# Edite o arquivo packages/frontend/.env:
VITE_API_URL=http://localhost:3001/api
```

### 4. Configure o Banco de Dados
```bash
# Entre na pasta do backend
cd packages/backend

# Execute as migrações do Prisma
npx prisma migrate dev --name init

# Gere o cliente Prisma
npx prisma generate

# Execute o seed (dados iniciais)
npm run db:seed

# (Opcional) Abra o Prisma Studio para visualizar os dados
npx prisma studio
```

### 5. Inicie os Serviços

#### Opção 1: Usar Turborepo (Recomendado)
```bash
# Na raiz do projeto, inicie todos os serviços
npm run dev
```

#### Opção 2: Iniciar Manualmente
```bash
# Terminal 1 - Backend
cd packages/backend
npm run dev

# Terminal 2 - Frontend
cd packages/frontend
npm run dev

# Terminal 3 - Shared (apenas se modificar tipos)
cd packages/shared
npm run dev
```

### 6. Acesse a Aplicação
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Prisma Studio**: http://localhost:5555 (se executado)

## 👤 Usuários de Teste

| Email | Senha | Perfil |
|-------|-------|--------|
| admin@calculadora.com | 123456 | Administrador |
| manager@calculadora.com | 123456 | Gerente |
| analyst@calculadora.com | 123456 | Analista |

## 🛠️ Scripts Úteis

```bash
# Instalar dependências
npm install

# Desenvolvimento (todos os serviços)
npm run dev

# Build de produção
npm run build

# Linting
npm run lint

# Verificação de tipos
npm run type-check

# Reset do banco de dados
cd packages/backend
npx prisma migrate reset

# Nova migração
npx prisma migrate dev --name nome_da_migracao

# Visualizar banco
npx prisma studio
```

## 🔧 Troubleshooting

### Erro de Conexão com PostgreSQL
```bash
# Verifique se o PostgreSQL está rodando
# Windows
net start postgresql-x64-14

# Linux/Mac
sudo service postgresql start
# ou
brew services start postgresql
```

### Erro "Cannot find module '@prisma/client'"
```bash
cd packages/backend
npx prisma generate
```

### Erro de CORS
Verifique se o `CORS_ORIGIN` no `.env` do backend está correto:
```
CORS_ORIGIN="http://localhost:3000"
```

### Porta já em uso
```bash
# Matar processo na porta 3001
# Windows
netstat -ano | findstr :3001
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:3001 | xargs kill -9
```

### Reset Completo
```bash
# Limpar node_modules
rm -rf node_modules packages/*/node_modules

# Reinstalar
npm install

# Reset do banco
cd packages/backend
npx prisma migrate reset
npm run db:seed
```

## 📁 Estrutura de Desenvolvimento

```
calculadora/
├── packages/
│   ├── shared/          # Tipos compartilhados
│   │   ├── src/
│   │   └── package.json
│   ├── backend/         # API Fastify
│   │   ├── src/
│   │   ├── prisma/
│   │   ├── .env         # Configurações locais
│   │   └── package.json
│   └── frontend/        # App React
│       ├── src/
│       ├── .env         # Configurações locais
│       └── package.json
├── package.json         # Root package
├── turbo.json          # Turborepo config
└── SETUP_LOCAL.md      # Este arquivo
```

## 🎯 Próximos Passos

1. ✅ Configurar PostgreSQL local
2. ✅ Instalar dependências
3. ✅ Configurar variáveis de ambiente
4. ✅ Executar migrações e seed
5. ✅ Iniciar serviços
6. 🎉 Começar a desenvolver!

---

**Dica**: Use `npm run dev` na raiz para iniciar todos os serviços simultaneamente com hot-reload.
