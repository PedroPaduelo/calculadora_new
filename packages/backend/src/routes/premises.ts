import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { PlanningPremiseSchema } from '@calculadora-hc/shared';

const CreatePremiseSchema = z.object({
  operationId: z.string().cuid(),
  plannedMonth: z.string().regex(/^\d{4}-\d{2}$/),
  volumeCurve: z.array(z.number().min(0)),
  tmiCurve: z.array(z.number().min(0)),
  tmaCurve: z.array(z.number().min(0)),
  unproductivityPercentage: z.number().min(0).max(100),
});

const UpdatePremiseSchema = CreatePremiseSchema.partial().omit({ operationId: true });

const ImportCurvesSchema = z.object({
  type: z.enum(['volume', 'tmi', 'tma']),
  data: z.array(z.number().min(0)),
});

const premiseRoutes: FastifyPluginAsync = async (fastify) => {
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

  // Get all premises
  fastify.get('/', { preHandler: authenticate }, async (request, reply) => {
    const premises = await fastify.prisma.planningPremise.findMany({
      orderBy: { plannedMonth: 'desc' },
      include: {
        operation: {
          select: { name: true },
        },
      },
    });

    // Deserialize JSON curves
    const premisesWithParsedCurves = premises.map(premise => ({
      ...premise,
      volumeCurve: JSON.parse(premise.volumeCurve),
      tmiCurve: JSON.parse(premise.tmiCurve),
      tmaCurve: JSON.parse(premise.tmaCurve),
    }));

    return reply.send({
      success: true,
      data: premisesWithParsedCurves,
    });
  });

  // Get premises for operation
  fastify.get('/operation/:operationId', { preHandler: authenticate }, async (request, reply) => {
    const { operationId } = request.params as { operationId: string };

    const premises = await fastify.prisma.planningPremise.findMany({
      where: { operationId },
      orderBy: { plannedMonth: 'desc' },
      include: {
        operation: {
          select: { name: true },
        },
      },
    });

    // Deserialize JSON curves
    const premisesWithParsedCurves = premises.map(premise => ({
      ...premise,
      volumeCurve: JSON.parse(premise.volumeCurve),
      tmiCurve: JSON.parse(premise.tmiCurve),
      tmaCurve: JSON.parse(premise.tmaCurve),
    }));

    return reply.send({
      success: true,
      data: premisesWithParsedCurves,
    });
  });

  // Get premise by ID
  fastify.get('/:id', { preHandler: authenticate }, async (request, reply) => {
    const { id } = request.params as { id: string };

    const premise = await fastify.prisma.planningPremise.findUnique({
      where: { id },
      include: {
        operation: true,
      },
    });

    if (!premise) {
      return reply.status(404).send({
        success: false,
        error: 'Planning premise not found',
      });
    }

    // Deserialize JSON curves
    const premiseWithParsedCurves = {
      ...premise,
      volumeCurve: JSON.parse(premise.volumeCurve),
      tmiCurve: JSON.parse(premise.tmiCurve),
      tmaCurve: JSON.parse(premise.tmaCurve),
    };

    return reply.send({
      success: true,
      data: premiseWithParsedCurves,
    });
  });

  // Create premise
  fastify.post('/', { preHandler: authenticate }, async (request, reply) => {
    try {
      const body = CreatePremiseSchema.parse(request.body);

      // Validate that curves have the same length
      if (body.volumeCurve.length !== body.tmiCurve.length || 
          body.volumeCurve.length !== body.tmaCurve.length) {
        return reply.status(400).send({
          success: false,
          error: 'All curves must have the same length',
        });
      }

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

      const premise = await fastify.prisma.planningPremise.create({
        data: {
          operationId: body.operationId,
          plannedMonth: body.plannedMonth,
          volumeCurve: JSON.stringify(body.volumeCurve),
          tmiCurve: JSON.stringify(body.tmiCurve),
          tmaCurve: JSON.stringify(body.tmaCurve),
          unproductivityPercentage: body.unproductivityPercentage,
        },
      });

      return reply.status(201).send({
        success: true,
        data: premise,
        message: 'Planning premise created successfully',
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

  // Update premise
  fastify.put('/:id', { preHandler: authenticate }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const body = UpdatePremiseSchema.parse(request.body);

      // Validate curves length if provided
      if (body.volumeCurve && body.tmiCurve && body.tmaCurve) {
        if (body.volumeCurve.length !== body.tmiCurve.length || 
            body.volumeCurve.length !== body.tmaCurve.length) {
          return reply.status(400).send({
            success: false,
            error: 'All curves must have the same length',
          });
        }
      }

      // Serialize curves if provided
      const updateData: any = { ...body };
      if (body.volumeCurve) updateData.volumeCurve = JSON.stringify(body.volumeCurve);
      if (body.tmiCurve) updateData.tmiCurve = JSON.stringify(body.tmiCurve);
      if (body.tmaCurve) updateData.tmaCurve = JSON.stringify(body.tmaCurve);

      const premise = await fastify.prisma.planningPremise.update({
        where: { id },
        data: updateData,
      });

      return reply.send({
        success: true,
        data: premise,
        message: 'Planning premise updated successfully',
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
          error: 'Planning premise not found',
        });
      }
      throw error;
    }
  });

  // Delete premise
  fastify.delete('/:id', { preHandler: authenticate }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string };

      await fastify.prisma.planningPremise.delete({
        where: { id },
      });

      return reply.send({
        success: true,
        message: 'Planning premise deleted successfully',
      });
    } catch (error) {
      if (error.code === 'P2025') {
        return reply.status(404).send({
          success: false,
          error: 'Planning premise not found',
        });
      }
      throw error;
    }
  });

  // Import curves from CSV/Excel
  fastify.post('/:id/import-curves', { preHandler: authenticate }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const body = ImportCurvesSchema.parse(request.body);

      const premise = await fastify.prisma.planningPremise.findUnique({
        where: { id },
      });

      if (!premise) {
        return reply.status(404).send({
          success: false,
          error: 'Planning premise not found',
        });
      }

      // Update the specific curve
      const updateData: any = {};
      switch (body.type) {
        case 'volume':
          updateData.volumeCurve = body.data;
          break;
        case 'tmi':
          updateData.tmiCurve = body.data;
          break;
        case 'tma':
          updateData.tmaCurve = body.data;
          break;
      }

      const updatedPremise = await fastify.prisma.planningPremise.update({
        where: { id },
        data: updateData,
      });

      return reply.send({
        success: true,
        data: updatedPremise,
        message: `${body.type.toUpperCase()} curve imported successfully`,
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

  // Bulk import premises from file
  fastify.post('/bulk-import', { preHandler: authenticate }, async (request, reply) => {
    try {
      // Handle multipart file upload
      const data = await request.file();
      
      if (!data) {
        return reply.status(400).send({
          success: false,
          error: 'No file provided',
        });
      }

      // TODO: Implement CSV/Excel parsing logic
      // For now, return a placeholder response
      return reply.send({
        success: true,
        message: 'Bulk import functionality will be implemented',
        data: {
          filename: data.filename,
          mimetype: data.mimetype,
        },
      });
    } catch (error) {
      throw error;
    }
  });
};

export default premiseRoutes;
