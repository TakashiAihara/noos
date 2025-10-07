/**
 * NotificationType Value Object
 */

import { ValidationError } from '@noos/suru-types';

export enum NotificationTypeEnum {
  TASK_ASSIGNED = 'TASK_ASSIGNED',
  TASK_COMPLETED = 'TASK_COMPLETED',
  TASK_UPDATED = 'TASK_UPDATED',
  TASK_COMMENTED = 'TASK_COMMENTED',
  TEAM_INVITATION = 'TEAM_INVITATION',
  TEAM_REMOVED = 'TEAM_REMOVED',
  PROJECT_CREATED = 'PROJECT_CREATED',
  PROJECT_ARCHIVED = 'PROJECT_ARCHIVED',
  SYSTEM_ALERT = 'SYSTEM_ALERT',
}

export class NotificationType {
  private readonly value: NotificationTypeEnum;

  private constructor(value: NotificationTypeEnum) {
    this.value = value;
  }

  static create(type: string): NotificationType {
    if (!Object.values(NotificationTypeEnum).includes(type as NotificationTypeEnum)) {
      throw new ValidationError(`Invalid notification type: ${type}`);
    }
    return new NotificationType(type as NotificationTypeEnum);
  }

  toString(): string {
    return this.value;
  }

  equals(other: NotificationType): boolean {
    return this.value === other.value;
  }

  isTaskRelated(): boolean {
    return [
      NotificationTypeEnum.TASK_ASSIGNED,
      NotificationTypeEnum.TASK_COMPLETED,
      NotificationTypeEnum.TASK_UPDATED,
      NotificationTypeEnum.TASK_COMMENTED,
    ].includes(this.value);
  }

  isTeamRelated(): boolean {
    return [
      NotificationTypeEnum.TEAM_INVITATION,
      NotificationTypeEnum.TEAM_REMOVED,
    ].includes(this.value);
  }

  isProjectRelated(): boolean {
    return [
      NotificationTypeEnum.PROJECT_CREATED,
      NotificationTypeEnum.PROJECT_ARCHIVED,
    ].includes(this.value);
  }
}
