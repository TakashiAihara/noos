/**
 * SessionId Value Object
 */

import { validateUUID } from '@noos/suru-utils';

export class SessionId {
  private readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  static create(id: string): SessionId {
    validateUUID(id);
    return new SessionId(id);
  }

  static generate(): SessionId {
    const { generateId } = require('@noos/suru-utils');
    return new SessionId(generateId());
  }

  toString(): string {
    return this.value;
  }

  equals(other: SessionId): boolean {
    return this.value === other.value;
  }
}
