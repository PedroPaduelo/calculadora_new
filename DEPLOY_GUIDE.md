# 🚀 Guia de Deploy - Calculadora HC

Este guia apresenta diferentes opções para fazer o deploy do sistema Calculadora HC em produção.

## 📋 Pré-requisitos

- Docker e Docker Compose instalados
- Servidor com pelo menos 2GB RAM e 20GB de disco
- Domínio configurado (opcional, mas recomendado)

## 🔧 Configuração Inicial

### 1. Preparar Variáveis de Ambiente

```bash
# Copie o arquivo de exemplo
cp .env.production .env

# Edite as configurações
nano .env
```

**⚠️ IMPORTANTE:** Altere TODAS as senhas e chaves secretas!

### 2. Gerar Chaves Seguras

```bash
# Para JWT_SECRET e JWT_REFRESH_SECRET, use:
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

## 🐳 Opção 1: Deploy com Docker (Recomendado)

### Deploy Simples (Servidor Único)

```bash
# 1. Clone o repositório
git clone <seu-repositorio>
cd calculadora

# 2. Configure as variáveis de ambiente
cp .env.production .env
# Edite o arquivo .env com suas configurações

# 3. Execute o deploy
docker-compose -f docker-compose.prod.yml --env-file .env up -d

# 4. Execute as migrações do banco
docker exec calculadora-backend-prod npx prisma migrate deploy
docker exec calculadora-backend-prod npx prisma db seed
```

### Verificar Status

```bash
# Ver logs
docker-compose -f docker-compose.prod.yml logs -f

# Verificar containers
docker ps

# Testar aplicação
curl http://localhost/api/health
```

## 🌐 Opção 2: Deploy em Cloud (AWS/Azure/GCP)

### AWS EC2 + RDS

1. **Criar instância EC2:**
   - Ubuntu 22.04 LTS
   - t3.medium (2 vCPU, 4GB RAM)
   - Security Group: portas 80, 443, 22

2. **Configurar RDS PostgreSQL:**
   - db.t3.micro
   - PostgreSQL 15
   - Backup automático habilitado

3. **Deploy na EC2:**

```bash
# Conectar na instância
ssh -i sua-chave.pem ubuntu@seu-ip

# Instalar Docker
sudo apt update
sudo apt install docker.io docker-compose -y
sudo usermod -aG docker ubuntu

# Clone e configure
git clone <seu-repositorio>
cd calculadora

# Configure .env com dados do RDS
nano .env

# Deploy
docker-compose -f docker-compose.prod.yml up -d
```

## 🔒 Opção 3: Deploy com HTTPS (Nginx + Let's Encrypt)

### 1. Criar docker-compose.https.yml

```yaml
version: '3.8'
services:
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf
      - ./certbot/conf:/etc/letsencrypt
      - ./certbot/www:/var/www/certbot
    depends_on:
      - frontend
      - backend

  certbot:
    image: certbot/certbot
    volumes:
      - ./certbot/conf:/etc/letsencrypt
      - ./certbot/www:/var/www/certbot
    command: certonly --webroot -w /var/www/certbot --force-renewal --email seu-email@dominio.com -d seu-dominio.com --agree-tos
```

### 2. Configurar SSL

```bash
# Obter certificado SSL
docker-compose -f docker-compose.https.yml run --rm certbot

# Reiniciar nginx
docker-compose -f docker-compose.https.yml restart nginx
```

## ☁️ Opção 4: Deploy Serverless (Vercel + Railway)

### Frontend (Vercel)

1. Conecte seu repositório no Vercel
2. Configure as variáveis:
   - `VITE_API_URL=https://sua-api.railway.app/api`
3. Deploy automático a cada push

### Backend (Railway)

1. Conecte seu repositório no Railway
2. Configure as variáveis de ambiente
3. Railway detecta automaticamente o Dockerfile

## 📊 Monitoramento e Manutenção

### Logs e Debugging

```bash
# Ver logs em tempo real
docker-compose -f docker-compose.prod.yml logs -f backend
docker-compose -f docker-compose.prod.yml logs -f frontend

# Acessar container
docker exec -it calculadora-backend-prod sh
```

### Backup do Banco

```bash
# Backup automático
docker exec calculadora-postgres-prod pg_dump -U postgres calculadora_hc > backup_$(date +%Y%m%d).sql

# Restaurar backup
docker exec -i calculadora-postgres-prod psql -U postgres calculadora_hc < backup_20240101.sql
```

### Atualizações

```bash
# Atualizar código
git pull origin main

# Rebuild e restart
docker-compose -f docker-compose.prod.yml build --no-cache
docker-compose -f docker-compose.prod.yml up -d

# Executar migrações se necessário
docker exec calculadora-backend-prod npx prisma migrate deploy
```

## 🔧 Troubleshooting

### Problemas Comuns

1. **Erro de conexão com banco:**
   ```bash
   # Verificar se PostgreSQL está rodando
   docker ps | grep postgres
   
   # Ver logs do banco
   docker logs calculadora-postgres-prod
   ```

2. **Frontend não carrega:**
   ```bash
   # Verificar se build foi feito
   docker exec calculadora-frontend-prod ls -la /usr/share/nginx/html
   
   # Ver logs do nginx
   docker logs calculadora-frontend-prod
   ```

3. **API não responde:**
   ```bash
   # Testar health check
   curl http://localhost:3001/health
   
   # Ver logs do backend
   docker logs calculadora-backend-prod
   ```

## 📈 Otimizações de Performance

### 1. Redis Cache
- Já configurado no docker-compose
- Cache de sessões e dados frequentes

### 2. Nginx Gzip
- Compressão automática configurada
- Reduz tamanho dos arquivos em ~70%

### 3. Database Optimization
```sql
-- Criar índices para performance
CREATE INDEX idx_operations_created_at ON operations(created_at);
CREATE INDEX idx_premises_operation_id ON planning_premises(operation_id);
```

## 🛡️ Segurança

### Checklist de Segurança

- [ ] Senhas fortes configuradas
- [ ] JWT secrets únicos e seguros
- [ ] HTTPS configurado
- [ ] Firewall configurado (apenas portas 80, 443, 22)
- [ ] Backup automático configurado
- [ ] Logs de auditoria habilitados
- [ ] Updates automáticos do sistema

### Configurações Recomendadas

```bash
# Firewall básico (Ubuntu)
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable

# Updates automáticos
sudo apt install unattended-upgrades
sudo dpkg-reconfigure unattended-upgrades
```

## 📞 Suporte

Em caso de problemas:

1. Verifique os logs: `docker-compose logs`
2. Teste conectividade: `curl http://localhost/api/health`
3. Verifique recursos: `docker stats`
4. Consulte este guia para soluções comuns

---

**🎉 Parabéns!** Seu sistema Calculadora HC está agora em produção e pronto para uso!
