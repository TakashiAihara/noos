/**
 * UserId Value Object
 */

import { validateUUID } from '@noos/suru-utils';

export class UserId {
  private readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  static create(id: string): UserId {
    validateUUID(id);
    return new UserId(id);
  }

  static generate(): UserId {
    const { generateId } = require('@noos/suru-utils');
    return new UserId(generateId());
  }

  toString(): string {
    return this.value;
  }

  equals(other: UserId): boolean {
    return this.value === other.value;
  }
}
