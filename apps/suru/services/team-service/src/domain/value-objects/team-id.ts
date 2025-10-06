/**
 * TeamId Value Object
 */

import { validateUUID } from '@noos/suru-utils';

export class TeamId {
  private readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  static create(id: string): TeamId {
    validateUUID(id);
    return new TeamId(id);
  }

  static generate(): TeamId {
    const { generateId } = require('@noos/suru-utils');
    return new TeamId(generateId());
  }

  toString(): string {
    return this.value;
  }

  equals(other: TeamId): boolean {
    return this.value === other.value;
  }
}
