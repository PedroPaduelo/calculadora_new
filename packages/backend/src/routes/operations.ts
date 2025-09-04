import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { OperationSchema } from '@calculadora-hc/shared';

const CreateOperationSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  workingHours: z.object({
    start: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
    end: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
  }),
  slaTarget: z.number().min(0).max(100),
  slaPercentage: z.number().min(0).max(100),
});

const UpdateOperationSchema = CreateOperationSchema.partial();

const operationRoutes: FastifyPluginAsync = async (fastify) => {
  // Authentication middleware
  const authenticate = async (request: any, reply: any) => {
    try {
      await request.jwtVerify();
    } catch (err) {
      reply.status(401).send({
        success: false,
        error: 'Unauthorized',
      });
    }
  };

  // Get all operations
  fastify.get('/', { preHandler: authenticate }, async (request, reply) => {
    const operations = await fastify.prisma.operation.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return reply.send({
      success: true,
      data: operations,
    });
  });

  // Get operation by ID
  fastify.get('/:id', { preHandler: authenticate }, async (request, reply) => {
    const { id } = request.params as { id: string };

    const operation = await fastify.prisma.operation.findUnique({
      where: { id },
      include: {
        premises: true,
        resourceAllocations: true,
        schedules: true,
        scenarios: true,
      },
    });

    if (!operation) {
      return reply.status(404).send({
        success: false,
        error: 'Operation not found',
      });
    }

    return reply.send({
      success: true,
      data: operation,
    });
  });

  // Create operation
  fastify.post('/', { preHandler: authenticate }, async (request, reply) => {
    try {
      const body = CreateOperationSchema.parse(request.body);

      const operation = await fastify.prisma.operation.create({
        data: {
          name: body.name,
          description: body.description,
          workingHours: body.workingHours,
          slaTarget: body.slaTarget,
          slaPercentage: body.slaPercentage,
        },
      });

      return reply.status(201).send({
        success: true,
        data: operation,
        message: 'Operation created successfully',
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

  // Update operation
  fastify.put('/:id', { preHandler: authenticate }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const body = UpdateOperationSchema.parse(request.body);

      const operation = await fastify.prisma.operation.update({
        where: { id },
        data: body,
      });

      return reply.send({
        success: true,
        data: operation,
        message: 'Operation updated successfully',
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({
          success: false,
          error: 'Validation error',
          details: error.errors,
        });
      }
      if (error.code === 'P2025') {
        return reply.status(404).send({
          success: false,
          error: 'Operation not found',
        });
      }
      throw error;
    }
  });

  // Delete operation
  fastify.delete('/:id', { preHandler: authenticate }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string };

      await fastify.prisma.operation.delete({
        where: { id },
      });

      return reply.send({
        success: true,
        message: 'Operation deleted successfully',
      });
    } catch (error) {
      if (error.code === 'P2025') {
        return reply.status(404).send({
          success: false,
          error: 'Operation not found',
        });
      }
      throw error;
    }
  });
};

export default operationRoutes;
