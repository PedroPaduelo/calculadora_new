import { FastifyPluginAsync } from 'fastify';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { LoginRequest, LoginResponse, User } from '@calculadora-hc/shared';

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const RegisterSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2),
  password: z.string().min(6),
  role: z.enum(['ADMIN', 'MANAGER', 'ANALYST']).optional().default('ANALYST'),
});

const authRoutes: FastifyPluginAsync = async (fastify) => {
  // Login
  fastify.post('/login', async (request, reply) => {
    try {
      const body = LoginSchema.parse(request.body);
      
      const user = await fastify.prisma.user.findUnique({
        where: { email: body.email },
      });

      if (!user || !await bcrypt.compare(body.password, user.password)) {
        return reply.status(401).send({
          success: false,
          error: 'Invalid credentials',
        });
      }

      const accessToken = fastify.jwt.sign(
        { userId: user.id, email: user.email, role: user.role },
        { expiresIn: '15m' }
      );

      const refreshToken = fastify.jwt.sign(
        { userId: user.id },
        { expiresIn: '7d' }
      );

      const userResponse: User = {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role.toLowerCase() as 'admin' | 'manager' | 'analyst',
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      };

      const response: LoginResponse = {
        success: true,
        data: userResponse,
        tokens: {
          accessToken,
          refreshToken,
        },
      };

      return reply.send(response);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({
          success: false,
          error: 'Validation error',
          details: error.errors,
        });
      }
      throw error;
    }
  });

  // Register
  fastify.post('/register', async (request, reply) => {
    try {
      const body = RegisterSchema.parse(request.body);
      
      const existingUser = await fastify.prisma.user.findUnique({
        where: { email: body.email },
      });

      if (existingUser) {
        return reply.status(409).send({
          success: false,
          error: 'User already exists',
        });
      }

      const hashedPassword = await bcrypt.hash(body.password, 10);

      const user = await fastify.prisma.user.create({
        data: {
          email: body.email,
          name: body.name,
          password: hashedPassword,
          role: body.role,
        },
      });

      const userResponse: User = {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role.toLowerCase() as 'admin' | 'manager' | 'analyst',
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      };

      return reply.status(201).send({
        success: true,
        data: userResponse,
        message: 'User created successfully',
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({
          success: false,
          error: 'Validation error',
          details: error.errors,
        });
      }
      throw error;
    }
  });

  // Refresh token
  fastify.post('/refresh', async (request, reply) => {
    try {
      const { refreshToken } = request.body as { refreshToken: string };
      
      if (!refreshToken) {
        return reply.status(401).send({
          success: false,
          error: 'Refresh token required',
        });
      }

      const decoded = fastify.jwt.verify(refreshToken) as { userId: string };
      
      const user = await fastify.prisma.user.findUnique({
        where: { id: decoded.userId },
      });

      if (!user) {
        return reply.status(401).send({
          success: false,
          error: 'Invalid refresh token',
        });
      }

      const accessToken = fastify.jwt.sign(
        { userId: user.id, email: user.email, role: user.role },
        { expiresIn: '15m' }
      );

      return reply.send({
        success: true,
        data: { accessToken },
      });
    } catch (error) {
      return reply.status(401).send({
        success: false,
        error: 'Invalid refresh token',
      });
    }
  });

  // Get current user
  fastify.get('/me', {
    preHandler: async (request, reply) => {
      try {
        await request.jwtVerify();
      } catch (err) {
        reply.status(401).send({
          success: false,
          error: 'Unauthorized',
        });
      }
    },
  }, async (request, reply) => {
    const { userId } = request.user as { userId: string };
    
    const user = await fastify.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return reply.status(404).send({
        success: false,
        error: 'User not found',
      });
    }

    const userResponse: User = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role.toLowerCase() as 'admin' | 'manager' | 'analyst',
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    return reply.send({
      success: true,
      data: userResponse,
    });
  });

  // Logout (optional - mainly for clearing client-side tokens)
  fastify.post('/logout', async (request, reply) => {
    return reply.send({
      success: true,
      message: 'Logged out successfully',
    });
  });
};

export default authRoutes;
