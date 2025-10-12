/**
 * Task Title Value Object
 */

import { ValidationError, validateLength, validateRequired } from '@noos/suru-utils';

export class TaskTitle {
  private readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  static create(title: string): TaskTitle {
    validateRequired(title, 'Task title');
    validateLength(title, 1, 200, 'Task title');
    return new TaskTitle(title.trim());
  }

  toString(): string {
    return this.value;
  }

  equals(other: TaskTitle): boolean {
    return this.value === other.value;
  }
}
