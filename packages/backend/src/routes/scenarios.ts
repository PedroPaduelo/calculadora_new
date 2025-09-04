import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { ScenarioSchema } from '@calculadora-hc/shared';

const CreateScenarioSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  operationId: z.string().cuid(),
  premisesSnapshot: z.record(z.any()),
  resultsSnapshot: z.record(z.any()),
});

const UpdateScenarioSchema = CreateScenarioSchema.partial().omit({ operationId: true });

const CompareScenarioSchema = z.object({
  scenarioIds: z.array(z.string().cuid()).min(2).max(5),
});

const scenarioRoutes: FastifyPluginAsync = async (fastify) => {
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

  // Get all scenarios for user
  fastify.get('/', { preHandler: authenticate }, async (request, reply) => {
    const { userId } = request.user as { userId: string };
    const { operationId } = request.query as { operationId?: string };

    const where: any = { userId };
    if (operationId) {
      where.operationId = operationId;
    }

    const scenarios = await fastify.prisma.scenario.findMany({
      where,
      include: {
        operation: {
          select: { name: true },
        },
        user: {
          select: { name: true, email: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return reply.send({
      success: true,
      data: scenarios,
    });
  });

  // Get scenario by ID
  fastify.get('/:id', { preHandler: authenticate }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const { userId } = request.user as { userId: string };

    const scenario = await fastify.prisma.scenario.findFirst({
      where: { id, userId },
      include: {
        operation: true,
        user: {
          select: { name: true, email: true },
        },
      },
    });

    if (!scenario) {
      return reply.status(404).send({
        success: false,
        error: 'Scenario not found',
      });
    }

    return reply.send({
      success: true,
      data: scenario,
    });
  });

  // Create scenario
  fastify.post('/', { preHandler: authenticate }, async (request, reply) => {
    try {
      const { userId } = request.user as { userId: string };
      const body = CreateScenarioSchema.parse(request.body);

      // Check if operation exists
      const operation = await fastify.prisma.operation.findUnique({
        where: { id: body.operationId },
      });

      if (!operation) {
        return reply.status(404).send({
          success: false,
          error: 'Operation not found',
        });
      }

      const scenario = await fastify.prisma.scenario.create({
        data: {
          name: body.name,
          description: body.description,
          userId,
          operationId: body.operationId,
          premisesSnapshot: body.premisesSnapshot,
          resultsSnapshot: body.resultsSnapshot,
        },
        include: {
          operation: {
            select: { name: true },
          },
        },
      });

      return reply.status(201).send({
        success: true,
        data: scenario,
        message: 'Scenario created successfully',
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

  // Update scenario
  fastify.put('/:id', { preHandler: authenticate }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const { userId } = request.user as { userId: string };
      const body = UpdateScenarioSchema.parse(request.body);

      const scenario = await fastify.prisma.scenario.updateMany({
        where: { id, userId },
        data: body,
      });

      if (scenario.count === 0) {
        return reply.status(404).send({
          success: false,
          error: 'Scenario not found',
        });
      }

      const updatedScenario = await fastify.prisma.scenario.findUnique({
        where: { id },
        include: {
          operation: {
            select: { name: true },
          },
        },
      });

      return reply.send({
        success: true,
        data: updatedScenario,
        message: 'Scenario updated successfully',
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

  // Clone scenario
  fastify.post('/:id/clone', { preHandler: authenticate }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const { userId } = request.user as { userId: string };
      const { name } = request.body as { name?: string };

      const originalScenario = await fastify.prisma.scenario.findFirst({
        where: { id, userId },
      });

      if (!originalScenario) {
        return reply.status(404).send({
          success: false,
          error: 'Scenario not found',
        });
      }

      const clonedScenario = await fastify.prisma.scenario.create({
        data: {
          name: name || `${originalScenario.name} (Copy)`,
          description: originalScenario.description,
          userId,
          operationId: originalScenario.operationId,
          premisesSnapshot: originalScenario.premisesSnapshot,
          resultsSnapshot: originalScenario.resultsSnapshot,
        },
        include: {
          operation: {
            select: { name: true },
          },
        },
      });

      return reply.status(201).send({
        success: true,
        data: clonedScenario,
        message: 'Scenario cloned successfully',
      });
    } catch (error) {
      throw error;
    }
  });

  // Compare scenarios
  fastify.post('/compare', { preHandler: authenticate }, async (request, reply) => {
    try {
      const { userId } = request.user as { userId: string };
      const body = CompareScenarioSchema.parse(request.body);

      const scenarios = await fastify.prisma.scenario.findMany({
        where: {
          id: { in: body.scenarioIds },
          userId,
        },
        include: {
          operation: {
            select: { name: true },
          },
        },
      });

      if (scenarios.length !== body.scenarioIds.length) {
        return reply.status(404).send({
          success: false,
          error: 'One or more scenarios not found',
        });
      }

      // Generate comparison metrics
      const comparison = {
        scenarios: scenarios.map(scenario => ({
          id: scenario.id,
          name: scenario.name,
          operation: scenario.operation.name,
          createdAt: scenario.createdAt,
          results: scenario.resultsSnapshot,
        })),
        metrics: {
          // Extract common metrics for comparison
          totalHC: scenarios.map(s => (s.resultsSnapshot as any)?.metrics?.totalHC || 0),
          avgOccupancy: scenarios.map(s => (s.resultsSnapshot as any)?.metrics?.avgOccupancy || 0),
          slaAchievement: scenarios.map(s => (s.resultsSnapshot as any)?.metrics?.slaAchieved || 0),
        },
        differences: {
          // Calculate differences between scenarios
          hcVariation: Math.max(...scenarios.map(s => (s.resultsSnapshot as any)?.metrics?.totalHC || 0)) - 
                      Math.min(...scenarios.map(s => (s.resultsSnapshot as any)?.metrics?.totalHC || 0)),
        },
      };

      return reply.send({
        success: true,
        data: comparison,
        message: 'Scenarios compared successfully',
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

  // Delete scenario
  fastify.delete('/:id', { preHandler: authenticate }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const { userId } = request.user as { userId: string };

      const result = await fastify.prisma.scenario.deleteMany({
        where: { id, userId },
      });

      if (result.count === 0) {
        return reply.status(404).send({
          success: false,
          error: 'Scenario not found',
        });
      }

      return reply.send({
        success: true,
        message: 'Scenario deleted successfully',
      });
    } catch (error) {
      throw error;
    }
  });

  // Get scenario history/versions
  fastify.get('/:id/history', { preHandler: authenticate }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const { userId } = request.user as { userId: string };

    // For now, return the scenario itself as history
    // In a full implementation, you'd have a separate versions table
    const scenario = await fastify.prisma.scenario.findFirst({
      where: { id, userId },
    });

    if (!scenario) {
      return reply.status(404).send({
        success: false,
        error: 'Scenario not found',
      });
    }

    return reply.send({
      success: true,
      data: [{
        version: 1,
        createdAt: scenario.createdAt,
        updatedAt: scenario.updatedAt,
        changes: 'Initial version',
        snapshot: scenario.premisesSnapshot,
      }],
    });
  });
};

export default scenarioRoutes;
