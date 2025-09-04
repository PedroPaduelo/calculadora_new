# Calculadora HC - Contact Center

Sistema avançado para planejamento e dimensionamento de recursos humanos (HC) em operações de contact center, com foco em otimização de escalas, garantia de SLA e eficiência financeira.

## 🚀 Funcionalidades Principais

### 8 Abas Obrigatórias
1. **Geral** - Dashboard executivo com visão geral
2. **Dimensionamento** - Cálculo de necessidade de HC
3. **Escala x Necessidade** - Comparação entre escala atual e necessidade
4. **Occupancy** - Taxa de ocupação dos recursos
5. **Hora Extra** - Gestão e análise de horas extras
6. **Treinamento** - Módulo de gestão de treinamentos
7. **Escala** - Gestão completa de escalas
8. **P.A's** - Performance Analytics (HCs, volume, AHT/TMI, NS, improdutividade, SLA)

### Funcionalidades Especiais
- ✅ Salvar cenários com usuário, data, hora e operação
- ✅ Reutilizar premissas por operação/pilar
- ✅ Exportar todas as visões
- ✅ Simular impacto de treinamentos e hora extra
- ✅ Otimização automática respeitando SLA e eficiência financeira
- ✅ Algoritmos Erlang C para dimensionamento
- ✅ Regras DSR (75% trabalham domingo, 25% folgam)
- ✅ Cargas horárias customizáveis (6:20, 8:12, 4:00)

## 🏗️ Arquitetura

### Stack Tecnológica
- **Frontend**: React + Vite + TypeScript + TanStack Query + Shadcn/UI
- **Backend**: Node.js + Fastify + Prisma + PostgreSQL
- **Infraestrutura**: Docker + Redis + Bull
- **Algoritmos**: Erlang C para dimensionamento, Simplex para otimização

### Estrutura do Projeto (Monorepo)
```
calculadora-hc/
├── packages/
│   ├── shared/          # Tipos e utilitários compartilhados
│   ├── backend/         # API Fastify
│   └── frontend/        # App React
├── docker-compose.yml   # Configuração Docker
├── turbo.json          # Configuração Turborepo
└── README.md
```

## 🚀 Quick Start

### Pré-requisitos
- Node.js 18+
- Docker e Docker Compose
- Git

### 1. Clone o repositório
```bash
git clone <repository-url>
cd calculadora
```

### 2. Instale as dependências
```bash
npm install
```

### 3. Configure o ambiente
```bash
# Backend
cp packages/backend/.env.example packages/backend/.env

# Edite o arquivo .env com suas configurações
```

### 4. Inicie os serviços com Docker
```bash
docker-compose up -d
```

### 5. Configure o banco de dados
```bash
# Entre no container do backend
docker exec -it calculadora-backend sh

# Execute as migrações
npx prisma migrate dev

# Execute o seed (dados iniciais)
npm run db:seed
```

### 6. Acesse a aplicação
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- Prisma Studio: http://localhost:5555

## 👤 Usuários de Teste

| Email | Senha | Perfil |
|-------|-------|--------|
| admin@calculadora.com | 123456 | Administrador |
| manager@calculadora.com | 123456 | Gerente |
| analyst@calculadora.com | 123456 | Analista |

## 🛠️ Desenvolvimento

### Scripts Disponíveis
```bash
# Desenvolvimento (todos os serviços)
npm run dev

# Build de produção
npm run build

# Testes
npm run test

# Linting
npm run lint

# Verificação de tipos
npm run type-check
```

### Desenvolvimento Local (sem Docker)
```bash
# Terminal 1 - Backend
cd packages/backend
npm run dev

# Terminal 2 - Frontend  
cd packages/frontend
npm run dev

# Terminal 3 - Shared (se modificando tipos)
cd packages/shared
npm run dev
```

## 📊 Modelo de Dados

### Entidades Principais
- **User** - Usuários do sistema
- **Operation** - Operações do contact center
- **PlanningPremise** - Premissas de planejamento (curvas, improdutividade)
- **WorkShift** - Turnos de trabalho
- **ResourceAllocation** - Alocação de recursos por período
- **Schedule** - Escalas de trabalho
- **Scenario** - Cenários salvos

## 🔧 API Endpoints

### Autenticação
- `POST /api/auth/login` - Login
- `POST /api/auth/refresh` - Renovar token
- `GET /api/auth/me` - Dados do usuário atual

### Operações
- `GET /api/operations` - Listar operações
- `POST /api/operations` - Criar operação
- `GET /api/operations/:id` - Obter operação
- `PUT /api/operations/:id` - Atualizar operação

### Premissas
- `GET /api/premises/operation/:id` - Premissas por operação
- `POST /api/premises` - Criar premissa
- `PUT /api/premises/:id` - Atualizar premissa

### Cálculos
- `POST /api/calculate/dimension` - Dimensionamento de HC
- `POST /api/calculate/schedule` - Otimização de escala
- `POST /api/calculate/optimization` - Otimização geral

### Cenários
- `GET /api/scenarios` - Listar cenários
- `POST /api/scenarios` - Criar cenário
- `POST /api/scenarios/compare` - Comparar cenários

## 🧮 Algoritmos

### Cálculo de HC (Erlang C)
O sistema utiliza a fórmula Erlang C para calcular a necessidade de agentes baseado em:
- Volume de chamadas por intervalo
- Tempo médio de atendimento (TMI)
- Meta de SLA
- Taxa de improdutividade

### Regras DSR
- 75% dos funcionários trabalham aos domingos
- 25% folgam aos domingos
- 125% de folgas semanais totais
- Rotação automática de folgas

### Turnos Padrão
| Duração | Improdutividade | Descrição |
|---------|----------------|-----------|
| 6:20 | 13.5% | Turno padrão |
| 8:12 | 18% | Turno estendido |
| 4:00 | 8.71% | Meio período |

## 🔒 Segurança

- Autenticação JWT com refresh tokens
- RBAC (Role-Based Access Control)
- Rate limiting (100 req/min)
- Validação de schemas com Zod
- Criptografia de senhas com bcrypt

## 📈 Performance

- Cache Redis para cálculos pesados
- Query optimization com índices
- Code splitting no frontend
- Lazy loading de componentes
- Bundle size otimizado

## 🐳 Docker

### Serviços
- **postgres**: Banco de dados PostgreSQL
- **redis**: Cache e filas
- **backend**: API Fastify
- **frontend**: Aplicação React

### Comandos Úteis
```bash
# Logs dos serviços
docker-compose logs -f

# Restart de um serviço
docker-compose restart backend

# Parar todos os serviços
docker-compose down

# Rebuild dos containers
docker-compose up --build
```

## 🧪 Testes

```bash
# Testes unitários
npm run test

# Testes E2E
npm run test:e2e

# Coverage
npm run test:coverage
```

## 📝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 🆘 Suporte

Para suporte e dúvidas:
- 📧 Email: suporte@calculadora.com
- 📚 Documentação: [Wiki do projeto]
- 🐛 Issues: [GitHub Issues]

---

**Desenvolvido com ❤️ para otimizar operações de contact center**
