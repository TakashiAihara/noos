/**
 * Priority Value Object
 */

import { Priority as PriorityEnum, ValidationError } from '@noos/suru-types';

export class Priority {
  private readonly value: PriorityEnum;

  private constructor(value: PriorityEnum) {
    this.value = value;
  }

  static create(priority: string): Priority {
    if (!Object.values(PriorityEnum).includes(priority as PriorityEnum)) {
      throw new ValidationError(`Invalid priority: ${priority}`);
    }
    return new Priority(priority as PriorityEnum);
  }

  static LOW(): Priority {
    return new Priority(PriorityEnum.LOW);
  }

  static MEDIUM(): Priority {
    return new Priority(PriorityEnum.MEDIUM);
  }

  static HIGH(): Priority {
    return new Priority(PriorityEnum.HIGH);
  }

  toString(): string {
    return this.value;
  }

  equals(other: Priority): boolean {
    return this.value === other.value;
  }
}
