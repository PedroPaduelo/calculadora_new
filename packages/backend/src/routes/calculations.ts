import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { 
  calculateHCDistribution, 
  calculateRequiredAgents,
  calculateOccupancy,
  optimizeShiftDistribution 
} from '@calculadora-hc/shared';

const DimensionCalculationSchema = z.object({
  operationId: z.string().cuid(),
  premiseId: z.string().cuid(),
  targetSLA: z.number().min(0).max(100).optional(),
  customUnproductivity: z.number().min(0).max(100).optional(),
});

const ScheduleCalculationSchema = z.object({
  operationId: z.string().cuid(),
  hcDistribution: z.array(z.number().min(0)),
  constraints: z.object({
    minSundayWork: z.number().min(0).max(1).default(0.75),
    weeklyDayOffRatio: z.number().min(0).default(1.25),
    maxWeeklyDays: z.number().min(1).max(7).default(6),
  }),
});

const OptimizationSchema = z.object({
  operationId: z.string().cuid(),
  hcNeeds: z.array(z.number().min(0)),
  shiftDurations: z.array(z.number().min(1).max(12)),
  constraints: z.object({
    minSundayWork: z.number().min(0).max(1).default(0.75),
    maxOvertimeRatio: z.number().min(0).default(0.2),
  }),
});

const calculationRoutes: FastifyPluginAsync = async (fastify) => {
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

  // Calculate HC dimensioning
  fastify.post('/dimension', { preHandler: authenticate }, async (request, reply) => {
    try {
      const body = DimensionCalculationSchema.parse(request.body);

      // Get premise data
      const premise = await fastify.prisma.planningPremise.findUnique({
        where: { id: body.premiseId },
        include: { operation: true },
      });

      if (!premise) {
        return reply.status(404).send({
          success: false,
          error: 'Planning premise not found',
        });
      }

      if (premise.operationId !== body.operationId) {
        return reply.status(400).send({
          success: false,
          error: 'Premise does not belong to the specified operation',
        });
      }

      const volumeCurve = premise.volumeCurve as number[];
      const tmiCurve = premise.tmiCurve as number[];
      const targetSLA = body.targetSLA || premise.operation.slaTarget;
      const unproductivity = body.customUnproductivity || premise.unproductivityPercentage;

      // Calculate HC distribution
      const hcDistribution = calculateHCDistribution(
        volumeCurve,
        tmiCurve,
        targetSLA,
        unproductivity
      );

      // Calculate additional metrics
      const totalHC = Math.max(...hcDistribution);
      const avgHC = hcDistribution.reduce((a, b) => a + b, 0) / hcDistribution.length;
      const peakHours = hcDistribution
        .map((hc, index) => ({ hc, hour: index }))
        .filter(item => item.hc === totalHC)
        .map(item => item.hour);

      // Calculate occupancy for each interval
      const occupancyData = volumeCurve.map((volume, index) => {
        const tmi = tmiCurve[index];
        const hc = hcDistribution[index];
        const traffic = (volume * tmi) / 3600; // Convert to Erlangs
        return calculateOccupancy(traffic, hc);
      });

      const result = {
        hcDistribution,
        metrics: {
          totalHC,
          avgHC: Math.round(avgHC * 100) / 100,
          peakHours,
          avgOccupancy: occupancyData.reduce((a, b) => a + b, 0) / occupancyData.length,
          maxOccupancy: Math.max(...occupancyData),
        },
        occupancyData,
        calculationParams: {
          targetSLA,
          unproductivity,
          intervals: volumeCurve.length,
        },
      };

      // Store calculation results
      await fastify.prisma.resourceAllocation.createMany({
        data: hcDistribution.map((hc, index) => ({
          operationId: body.operationId,
          date: new Date(),
          timeInterval: `${Math.floor(index / 4).toString().padStart(2, '0')}:${((index % 4) * 15).toString().padStart(2, '0')}`,
          requiredHCs: hc,
          allocatedHCs: hc,
          occupancy: occupancyData[index],
          slaAchieved: targetSLA,
        })),
      });

      return reply.send({
        success: true,
        data: result,
        message: 'HC dimensioning calculated successfully',
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

  // Calculate schedule optimization
  fastify.post('/schedule', { preHandler: authenticate }, async (request, reply) => {
    try {
      const body = ScheduleCalculationSchema.parse(request.body);

      // Get operation data
      const operation = await fastify.prisma.operation.findUnique({
        where: { id: body.operationId },
      });

      if (!operation) {
        return reply.status(404).send({
          success: false,
          error: 'Operation not found',
        });
      }

      // Generate basic schedule (simplified algorithm)
      const { hcDistribution, constraints } = body;
      const totalHC = Math.max(...hcDistribution);
      
      // Create a basic schedule structure
      const schedule = [];
      const daysInWeek = 7;
      const employeesNeeded = totalHC;

      for (let emp = 0; emp < employeesNeeded; emp++) {
        const employeeSchedule = [];
        
        for (let day = 0; day < daysInWeek; day++) {
          // Simple logic: 75% work on Sunday (day 0), others rotate
          if (day === 0) { // Sunday
            const shouldWork = emp < Math.floor(employeesNeeded * constraints.minSundayWork);
            employeeSchedule.push(shouldWork);
          } else {
            // Distribute other days to ensure coverage
            const shouldWork = (emp + day) % 7 < constraints.maxWeeklyDays;
            employeeSchedule.push(shouldWork);
          }
        }
        
        schedule.push(employeeSchedule);
      }

      // Calculate compliance metrics
      const sundayWorkers = schedule.filter(emp => emp[0]).length;
      const sundayWorkRate = sundayWorkers / employeesNeeded;
      const avgWeeklyDays = schedule.reduce((sum, emp) => 
        sum + emp.filter(Boolean).length, 0) / employeesNeeded;

      const result = {
        schedule,
        metrics: {
          totalEmployees: employeesNeeded,
          sundayWorkers,
          sundayWorkRate,
          avgWeeklyDays,
          compliance: {
            sundayWork: sundayWorkRate >= constraints.minSundayWork,
            weeklyDays: avgWeeklyDays <= constraints.maxWeeklyDays,
          },
        },
        constraints,
      };

      return reply.send({
        success: true,
        data: result,
        message: 'Schedule calculated successfully',
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

  // Optimize resource allocation
  fastify.post('/optimization', { preHandler: authenticate }, async (request, reply) => {
    try {
      const body = OptimizationSchema.parse(request.body);

      // Get operation data
      const operation = await fastify.prisma.operation.findUnique({
        where: { id: body.operationId },
      });

      if (!operation) {
        return reply.status(404).send({
          success: false,
          error: 'Operation not found',
        });
      }

      // Run optimization algorithm
      const optimization = optimizeShiftDistribution(
        body.hcNeeds,
        body.shiftDurations,
        body.constraints
      );

      const result = {
        optimization,
        recommendations: {
          totalHC: optimization.totalHC,
          overtimeHours: optimization.overtimeHours,
          costEfficiency: optimization.overtimeHours < (optimization.totalHC * 0.1),
          shiftBalance: optimization.shiftAllocations.every(alloc => alloc > 0),
        },
        constraints: body.constraints,
      };

      return reply.send({
        success: true,
        data: result,
        message: 'Resource optimization completed successfully',
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

  // Get calculation results
  fastify.get('/results/:operationId', { preHandler: authenticate }, async (request, reply) => {
    const { operationId } = request.params as { operationId: string };

    const results = await fastify.prisma.resourceAllocation.findMany({
      where: { operationId },
      orderBy: { date: 'desc' },
      take: 96, // Last 96 intervals (24 hours * 4 intervals per hour)
    });

    return reply.send({
      success: true,
      data: results,
    });
  });

  // Health check for calculation service
  fastify.get('/health', async (request, reply) => {
    return reply.send({
      success: true,
      service: 'calculations',
      algorithms: {
        erlangC: 'available',
        optimization: 'available',
        scheduling: 'available',
      },
      timestamp: new Date().toISOString(),
    });
  });
};

export default calculationRoutes;
