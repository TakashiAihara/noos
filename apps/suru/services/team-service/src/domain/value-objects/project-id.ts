/**
 * ProjectId Value Object
 */

import { validateUUID } from '@noos/suru-utils';

export class ProjectId {
  private readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  static create(id: string): ProjectId {
    validateUUID(id);
    return new ProjectId(id);
  }

  static generate(): ProjectId {
    const { generateId } = require('@noos/suru-utils');
    return new ProjectId(generateId());
  }

  toString(): string {
    return this.value;
  }

  equals(other: ProjectId): boolean {
    return this.value === other.value;
  }
}
