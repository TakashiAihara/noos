/**
 * Date utility functions
 */

/**
 * Converts Date to ISO 8601 string
 */
export function toISOString(date: Date): string {
  return date.toISOString();
}

/**
 * Parses ISO 8601 string to Date
 */
export function fromISOString(isoString: string): Date {
  return new Date(isoString);
}

/**
 * Checks if date is in the past
 */
export function isPast(date: Date): boolean {
  return date < new Date();
}

/**
 * Checks if date is in the future
 */
export function isFuture(date: Date): boolean {
  return date > new Date();
}

/**
 * Adds days to a date
 */
export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}
