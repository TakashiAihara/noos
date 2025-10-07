/**
 * NotificationId Value Object
 */

import { validateUUID } from '@noos/suru-utils';

export class NotificationId {
  private readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  static create(id: string): NotificationId {
    validateUUID(id);
    return new NotificationId(id);
  }

  static generate(): NotificationId {
    const { generateId } = require('@noos/suru-utils');
    return new NotificationId(generateId());
  }

  toString(): string {
    return this.value;
  }

  equals(other: NotificationId): boolean {
    return this.value === other.value;
  }
}
