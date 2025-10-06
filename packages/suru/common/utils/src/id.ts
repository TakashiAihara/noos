/**
 * ID generation utilities
 */

import { randomUUID } from 'node:crypto';

/**
 * Generates a new UUID v4
 */
export function generateId(): string {
  return randomUUID();
}
