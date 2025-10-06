/**
 * Task Status Value Object
 */

import { TaskStatus as TaskStatusEnum } from '@noos/suru-types';
import { ValidationError } from '@noos/suru-utils';

export class TaskStatus {
  private readonly value: TaskStatusEnum;

  private constructor(value: TaskStatusEnum) {
    this.value = value;
  }

  static create(status: string): TaskStatus {
    if (!Object.values(TaskStatusEnum).includes(status as TaskStatusEnum)) {
      throw new ValidationError(`Invalid task status: ${status}`);
    }
    return new TaskStatus(status as TaskStatusEnum);
  }

  static TODO(): TaskStatus {
    return new TaskStatus(TaskStatusEnum.TODO);
  }

  static IN_PROGRESS(): TaskStatus {
    return new TaskStatus(TaskStatusEnum.IN_PROGRESS);
  }

  static DONE(): TaskStatus {
    return new TaskStatus(TaskStatusEnum.DONE);
  }

  canTransitionTo(newStatus: TaskStatus): boolean {
    // TODO can go to IN_PROGRESS or DONE
    if (this.value === TaskStatusEnum.TODO) {
      return true;
    }
    // IN_PROGRESS can go to TODO or DONE
    if (this.value === TaskStatusEnum.IN_PROGRESS) {
      return true;
    }
    // DONE can be reopened to TODO or IN_PROGRESS
    if (this.value === TaskStatusEnum.DONE) {
      return true;
    }
    return false;
  }

  toString(): string {
    return this.value;
  }

  equals(other: TaskStatus): boolean {
    return this.value === other.value;
  }
}
