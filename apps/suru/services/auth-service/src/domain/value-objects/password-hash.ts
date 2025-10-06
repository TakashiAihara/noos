/**
 * PasswordHash Value Object
 */

import { validateRequired } from '@noos/suru-utils';
import { ValidationError } from '@noos/suru-types';

export class PasswordHash {
  private readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  /**
   * Create from an already hashed password
   */
  static fromHash(hash: string): PasswordHash {
    validateRequired(hash, 'Password hash');

    // Validate bcrypt hash format ($2a$, $2b$, or $2y$ followed by cost and hash)
    const bcryptRegex = /^\$2[aby]\$\d{2}\$.{53}$/;
    if (!bcryptRegex.test(hash)) {
      throw new ValidationError('Invalid password hash format');
    }

    return new PasswordHash(hash);
  }

  /**
   * Create from plain text password (to be hashed by infrastructure layer)
   * This is a factory method that will be used in conjunction with a hashing service
   */
  static createPlaceholder(): PasswordHash {
    // This creates a placeholder that will be replaced by actual hash
    // The actual hashing should be done by infrastructure layer
    return new PasswordHash('$2b$10$PLACEHOLDER_TO_BE_REPLACED_BY_INFRASTRUCTURE');
  }

  toString(): string {
    return this.value;
  }

  equals(other: PasswordHash): boolean {
    return this.value === other.value;
  }
}
