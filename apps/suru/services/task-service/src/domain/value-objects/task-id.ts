/**
 * Task ID Value Object
 */

import { ValidationError, validateUUID } from '@noos/suru-utils';

export class TaskId {
  private readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  static create(id: string): TaskId {
    validateUUID(id);
    return new TaskId(id);
  }

  static generate(): TaskId {
    const { generateId } = require('@noos/suru-utils');
    return new TaskId(generateId());
  }

  toString(): string {
    return this.value;
  }

  equals(other: TaskId): boolean {
    return this.value === other.value;
  }
}
