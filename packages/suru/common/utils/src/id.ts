/**
 * ID generation utilities
 */

import crypto from 'crypto';

/**
 * Generates a new UUID v4
 */
export function generateId(): string {
  return crypto.randomUUID();
}
