import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import rateLimit from '@fastify/rate-limit';
import multipart from '@fastify/multipart';
import { PrismaClient } from '@prisma/client';

// Import routes
import authRoutes from './routes/auth';
import operationRoutes from './routes/operations';
import premiseRoutes from './routes/premises';
import calculationRoutes from './routes/calculations';
import scenarioRoutes from './routes/scenarios';

const prisma = new PrismaClient();

async function buildServer() {
  const fastify = Fastify({
    logger: {
      level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    },
  });

  // Register plugins
  await fastify.register(cors, {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
  });

  await fastify.register(jwt, {
    secret: process.env.JWT_SECRET || 'your-secret-key',
  });

  await fastify.register(rateLimit, {
    max: 100,
    timeWindow: '1 minute',
  });

  await fastify.register(multipart);

  // Add Prisma to Fastify instance
  fastify.decorate('prisma', prisma);

  // Register routes
  await fastify.register(authRoutes, { prefix: '/api/auth' });
  await fastify.register(operationRoutes, { prefix: '/api/operations' });
  await fastify.register(premiseRoutes, { prefix: '/api/premises' });
  await fastify.register(calculationRoutes, { prefix: '/api/calculate' });
  await fastify.register(scenarioRoutes, { prefix: '/api/scenarios' });

  // Health check
  fastify.get('/health', async () => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  });

  // Global error handler
  fastify.setErrorHandler((error, request, reply) => {
    fastify.log.error(error);
    
    if (error.validation) {
      reply.status(400).send({
        success: false,
        error: 'Validation Error',
        details: error.validation,
      });
      return;
    }

    reply.status(500).send({
      success: false,
      error: 'Internal Server Error',
      message: process.env.NODE_ENV === 'production' ? 'Something went wrong' : error.message,
    });
  });

  return fastify;
}

async function start() {
  try {
    const fastify = await buildServer();
    const port = parseInt(process.env.PORT || '3001');
    
    await fastify.listen({ port, host: '0.0.0.0' });
    fastify.log.info(`Server running on port ${port}`);
  } catch (err) {
    console.error('Error starting server:', err);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('Received SIGINT, shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('Received SIGTERM, shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

if (require.main === module) {
  start();
}

export { buildServer };
