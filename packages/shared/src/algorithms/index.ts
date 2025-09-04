// Core algorithms for HC calculation

/**
 * Erlang C formula for calculating probability of delay
 */
export function erlangC(agents: number, traffic: number): number {
  if (agents <= 0 || traffic <= 0) return 0;
  if (traffic >= agents) return 1;

  // Calculate Erlang B first
  let erlangB = Math.pow(traffic, agents) / factorial(agents);
  let sum = 0;
  
  for (let i = 0; i <= agents; i++) {
    sum += Math.pow(traffic, i) / factorial(i);
  }
  
  erlangB = erlangB / sum;
  
  // Calculate Erlang C
  const erlangC = erlangB / (1 - (traffic / agents) * (1 - erlangB));
  
  return Math.min(erlangC, 1);
}

/**
 * Calculate factorial (optimized for small numbers)
 */
function factorial(n: number): number {
  if (n <= 1) return 1;
  let result = 1;
  for (let i = 2; i <= n; i++) {
    result *= i;
  }
  return result;
}

/**
 * Calculate required agents using Erlang C model
 */
export function calculateRequiredAgents(
  callVolume: number,
  averageHandleTime: number, // in seconds
  targetServiceLevel: number, // percentage (0-100)
  targetAnswerTime: number = 20 // in seconds
): number {
  if (callVolume <= 0 || averageHandleTime <= 0) return 0;
  
  // Convert to traffic intensity (Erlangs)
  const traffic = (callVolume * averageHandleTime) / 3600; // calls/hour * AHT/3600
  
  // Start with minimum agents based on traffic
  let agents = Math.ceil(traffic);
  
  // Iterate to find minimum agents that meet SLA
  while (agents < traffic * 3) { // Safety limit
    const probDelay = erlangC(agents, traffic);
    const avgWaitTime = (probDelay * averageHandleTime) / (agents - traffic);
    
    // Calculate service level (% answered within target time)
    const serviceLevel = (1 - probDelay * Math.exp(-(agents - traffic) * targetAnswerTime / averageHandleTime)) * 100;
    
    if (serviceLevel >= targetServiceLevel) {
      return agents;
    }
    
    agents++;
  }
  
  return agents;
}

/**
 * Calculate HC need for a time interval
 */
export function calculateHCNeed(input: {
  volume: number;
  tmi: number; // in seconds
  targetSLA: number;
  unproductivity: number; // percentage
}): number {
  const { volume, tmi, targetSLA, unproductivity } = input;
  
  if (volume <= 0 || tmi <= 0) return 0;
  
  // Calculate base required agents
  const baseAgents = calculateRequiredAgents(volume, tmi, targetSLA);
  
  // Adjust for unproductivity
  const adjustedAgents = baseAgents / (1 - unproductivity / 100);
  
  return Math.ceil(adjustedAgents);
}

/**
 * Calculate HC distribution across time intervals
 */
export function calculateHCDistribution(
  volumeCurve: number[],
  tmiCurve: number[],
  targetSLA: number,
  unproductivity: number
): number[] {
  if (volumeCurve.length !== tmiCurve.length) {
    throw new Error('Volume and TMI curves must have the same length');
  }
  
  return volumeCurve.map((volume, index) => {
    const tmi = tmiCurve[index];
    return calculateHCNeed({ volume, tmi, targetSLA, unproductivity });
  });
}

/**
 * Calculate occupancy rate
 */
export function calculateOccupancy(
  traffic: number, // in Erlangs
  agents: number
): number {
  if (agents <= 0) return 0;
  return Math.min((traffic / agents) * 100, 100);
}

/**
 * Calculate shrinkage (unproductivity) impact
 */
export function calculateShrinkage(
  baseHC: number,
  shrinkagePercentage: number
): {
  productiveHC: number;
  unproductiveHC: number;
  totalRequired: number;
} {
  const shrinkageRate = shrinkagePercentage / 100;
  const productiveHC = Math.floor(baseHC * (1 - shrinkageRate));
  const unproductiveHC = baseHC - productiveHC;
  const totalRequired = Math.ceil(baseHC / (1 - shrinkageRate));
  
  return {
    productiveHC,
    unproductiveHC,
    totalRequired
  };
}

/**
 * Optimize schedule distribution across shifts
 */
export function optimizeShiftDistribution(
  hourlyNeeds: number[],
  shiftDurations: number[], // in hours
  constraints: {
    minSundayWork: number;
    maxOvertimeRatio: number;
  }
): {
  shiftAllocations: number[];
  totalHC: number;
  overtimeHours: number;
} {
  // Simplified optimization - in production, use linear programming
  const totalNeed = Math.max(...hourlyNeeds);
  const avgShiftDuration = shiftDurations.reduce((a, b) => a + b, 0) / shiftDurations.length;
  
  // Basic allocation proportional to shift duration
  const shiftAllocations = shiftDurations.map(duration => 
    Math.ceil((totalNeed * duration) / avgShiftDuration)
  );
  
  const totalHC = shiftAllocations.reduce((a, b) => a + b, 0);
  const overtimeHours = Math.max(0, totalHC * avgShiftDuration - totalNeed * 8);
  
  return {
    shiftAllocations,
    totalHC,
    overtimeHours
  };
}

/**
 * Calculate DSR (Weekly Rest) compliance
 */
export function calculateDSRCompliance(
  weeklySchedule: boolean[][], // [employee][day] - true if working
  constraints: {
    minSundayWork: number; // 0.75 = 75%
    maxWeeklyDays: number; // 5 or 6
  }
): {
  compliant: boolean;
  sundayWorkRate: number;
  avgWeeklyDays: number;
  violations: string[];
} {
  const violations: string[] = [];
  let totalEmployees = weeklySchedule.length;
  let sundayWorkers = 0;
  let totalWeeklyDays = 0;
  
  weeklySchedule.forEach((employeeWeek, empIndex) => {
    // Check Sunday work (day 0)
    if (employeeWeek[0]) sundayWorkers++;
    
    // Count working days
    const workingDays = employeeWeek.filter(Boolean).length;
    totalWeeklyDays += workingDays;
    
    // Check max weekly days
    if (workingDays > constraints.maxWeeklyDays) {
      violations.push(`Employee ${empIndex} works ${workingDays} days (max: ${constraints.maxWeeklyDays})`);
    }
  });
  
  const sundayWorkRate = totalEmployees > 0 ? sundayWorkers / totalEmployees : 0;
  const avgWeeklyDays = totalEmployees > 0 ? totalWeeklyDays / totalEmployees : 0;
  
  // Check Sunday work compliance
  if (sundayWorkRate < constraints.minSundayWork) {
    violations.push(`Sunday work rate ${(sundayWorkRate * 100).toFixed(1)}% below minimum ${(constraints.minSundayWork * 100)}%`);
  }
  
  return {
    compliant: violations.length === 0,
    sundayWorkRate,
    avgWeeklyDays,
    violations
  };
}
