import { z } from 'zod';

// Core domain types
export const OperationSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  description: z.string().optional(),
  workingHours: z.object({
    start: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
    end: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
  }),
  slaTarget: z.number().min(0).max(100),
  slaPercentage: z.number().min(0).max(100),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const WorkShiftSchema = z.object({
  id: z.string().uuid(),
  duration: z.enum(['6:20', '8:12', '4:00']),
  unproductivityRate: z.number().min(0).max(1),
  minLoginTime: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
  maxLoginTime: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
});

export const PlanningPremiseSchema = z.object({
  id: z.string().uuid(),
  operationId: z.string().uuid(),
  plannedMonth: z.string().regex(/^\d{4}-\d{2}$/),
  volumeCurve: z.array(z.number().min(0)),
  tmiCurve: z.array(z.number().min(0)),
  tmaCurve: z.array(z.number().min(0)),
  unproductivityPercentage: z.number().min(0).max(100),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const ResourceAllocationSchema = z.object({
  id: z.string().uuid(),
  operationId: z.string().uuid(),
  date: z.date(),
  timeInterval: z.string(),
  requiredHCs: z.number().min(0),
  allocatedHCs: z.number().min(0),
  occupancy: z.number().min(0).max(100),
  slaAchieved: z.number().min(0).max(100),
});

export const ScheduleSchema = z.object({
  id: z.string().uuid(),
  operationId: z.string().uuid(),
  employeeId: z.string().uuid(),
  date: z.date(),
  shift: z.string(),
  status: z.enum(['working', 'dayOff', 'training']),
});

export const ScenarioSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  description: z.string().optional(),
  userId: z.string().uuid(),
  operationId: z.string().uuid(),
  premisesSnapshot: z.record(z.any()),
  resultsSnapshot: z.record(z.any()),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Calculation types
export const CalculationInputSchema = z.object({
  volume: z.array(z.number().min(0)),
  tmi: z.array(z.number().min(0)),
  targetSLA: z.number().min(0).max(100),
  unproductivity: z.number().min(0).max(100),
});

export const ScheduleConstraintsSchema = z.object({
  minSundayWork: z.number().min(0).max(1).default(0.75),
  weeklyDayOffRatio: z.number().min(0).default(1.25),
  shiftGroups: z.array(z.object({
    name: z.string(),
    timeRange: z.object({
      start: z.string(),
      end: z.string(),
    }),
  })),
});

// Shift groups enum
export const ShiftGroups = {
  MADRUGADA: { name: 'Madrugada', start: '00:00', end: '05:30' },
  MANHA: { name: 'Manhã', start: '06:00', end: '11:30' },
  TARDE: { name: 'Tarde', start: '12:00', end: '17:30' },
  NOITE: { name: 'Noite', start: '18:00', end: '23:30' },
} as const;

// Export inferred types
export type Operation = z.infer<typeof OperationSchema>;
export type WorkShift = z.infer<typeof WorkShiftSchema>;
export type PlanningPremise = z.infer<typeof PlanningPremiseSchema>;
export type ResourceAllocation = z.infer<typeof ResourceAllocationSchema>;
export type Schedule = z.infer<typeof ScheduleSchema>;
export type Scenario = z.infer<typeof ScenarioSchema>;
export type CalculationInput = z.infer<typeof CalculationInputSchema>;
export type ScheduleConstraints = z.infer<typeof ScheduleConstraintsSchema>;

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Authentication types
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'manager' | 'analyst';
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse extends ApiResponse<User> {
  tokens: AuthTokens;
}
