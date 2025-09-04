// Utility functions for HC calculations

/**
 * Convert time string (HH:MM) to minutes
 */
export function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

/**
 * Convert minutes to time string (HH:MM)
 */
export function minutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

/**
 * Calculate work shift duration in minutes
 */
export function getShiftDurationMinutes(duration: '6:20' | '8:12' | '4:00'): number {
  switch (duration) {
    case '6:20':
      return 6 * 60 + 20; // 380 minutes
    case '8:12':
      return 8 * 60 + 12; // 492 minutes
    case '4:00':
      return 4 * 60; // 240 minutes
    default:
      throw new Error(`Invalid shift duration: ${duration}`);
  }
}

/**
 * Get unproductivity rate by shift duration
 */
export function getUnproductivityRate(duration: '6:20' | '8:12' | '4:00'): number {
  switch (duration) {
    case '6:20':
      return 0.135; // 13.5%
    case '8:12':
      return 0.18; // 18%
    case '4:00':
      return 0.0871; // 8.71%
    default:
      throw new Error(`Invalid shift duration: ${duration}`);
  }
}

/**
 * Check if a time falls within a shift group
 */
export function isTimeInShiftGroup(
  time: string,
  shiftStart: string,
  shiftEnd: string
): boolean {
  const timeMinutes = timeToMinutes(time);
  const startMinutes = timeToMinutes(shiftStart);
  const endMinutes = timeToMinutes(shiftEnd);

  // Handle overnight shifts (e.g., 18:00-05:30)
  if (startMinutes > endMinutes) {
    return timeMinutes >= startMinutes || timeMinutes <= endMinutes;
  }

  return timeMinutes >= startMinutes && timeMinutes <= endMinutes;
}

/**
 * Generate time intervals for a day (15-minute intervals)
 */
export function generateTimeIntervals(): string[] {
  const intervals: string[] = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 15) {
      const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      intervals.push(timeStr);
    }
  }
  return intervals;
}

/**
 * Calculate productive hours from total hours and unproductivity rate
 */
export function calculateProductiveHours(
  totalHours: number,
  unproductivityRate: number
): number {
  return totalHours * (1 - unproductivityRate);
}

/**
 * Format number as percentage
 */
export function formatPercentage(value: number, decimals: number = 1): string {
  return `${(value * 100).toFixed(decimals)}%`;
}

/**
 * Calculate SLA achievement based on calls answered within threshold
 */
export function calculateSLA(
  callsAnsweredInTime: number,
  totalCalls: number
): number {
  if (totalCalls === 0) return 0;
  return (callsAnsweredInTime / totalCalls) * 100;
}

/**
 * Validate if a month string is in YYYY-MM format
 */
export function isValidMonthFormat(month: string): boolean {
  return /^\d{4}-\d{2}$/.test(month);
}

/**
 * Get days in month
 */
export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

/**
 * Check if date is weekend (Saturday or Sunday)
 */
export function isWeekend(date: Date): boolean {
  const day = date.getDay();
  return day === 0 || day === 6; // Sunday = 0, Saturday = 6
}

/**
 * Check if date is Sunday
 */
export function isSunday(date: Date): boolean {
  return date.getDay() === 0;
}

/**
 * Generate date range between two dates
 */
export function generateDateRange(startDate: Date, endDate: Date): Date[] {
  const dates: Date[] = [];
  const currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    dates.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return dates;
}
