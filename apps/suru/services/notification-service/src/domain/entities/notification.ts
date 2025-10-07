/**
 * Notification Entity (Aggregate Root)
 */

import { ValidationError } from '@noos/suru-types';
import { NotificationId } from '../value-objects/notification-id';
import { NotificationType } from '../value-objects/notification-type';

export interface NotificationProps {
  id: NotificationId;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  relatedEntityId?: string;
  relatedEntityType?: string;
  isRead: boolean;
  createdAt: Date;
  readAt?: Date;
  version: number;
}

export class Notification {
  private props: NotificationProps;

  private constructor(props: NotificationProps) {
    this.props = props;
  }

  static create(params: {
    userId: string;
    type: string;
    title: string;
    message: string;
    relatedEntityId?: string;
    relatedEntityType?: string;
  }): Notification {
    const notificationId = NotificationId.generate();
    const type = NotificationType.create(params.type);

    if (!params.title || params.title.trim().length === 0) {
      throw new ValidationError('Notification title is required');
    }

    if (!params.message || params.message.trim().length === 0) {
      throw new ValidationError('Notification message is required');
    }

    if (params.title.length > 200) {
      throw new ValidationError(
        'Notification title must be less than 200 characters',
      );
    }

    if (params.message.length > 1000) {
      throw new ValidationError(
        'Notification message must be less than 1000 characters',
      );
    }

    return new Notification({
      id: notificationId,
      userId: params.userId,
      type,
      title: params.title.trim(),
      message: params.message.trim(),
      relatedEntityId: params.relatedEntityId,
      relatedEntityType: params.relatedEntityType,
      isRead: false,
      createdAt: new Date(),
      version: 1,
    });
  }

  static reconstitute(props: {
    id: string;
    userId: string;
    type: string;
    title: string;
    message: string;
    relatedEntityId?: string;
    relatedEntityType?: string;
    isRead: boolean;
    createdAt: Date;
    readAt?: Date;
    version: number;
  }): Notification {
    return new Notification({
      id: NotificationId.create(props.id),
      userId: props.userId,
      type: NotificationType.create(props.type),
      title: props.title,
      message: props.message,
      relatedEntityId: props.relatedEntityId,
      relatedEntityType: props.relatedEntityType,
      isRead: props.isRead,
      createdAt: props.createdAt,
      readAt: props.readAt,
      version: props.version,
    });
  }

  // Getters
  get id(): string {
    return this.props.id.toString();
  }

  get userId(): string {
    return this.props.userId;
  }

  get type(): string {
    return this.props.type.toString();
  }

  get title(): string {
    return this.props.title;
  }

  get message(): string {
    return this.props.message;
  }

  get relatedEntityId(): string | undefined {
    return this.props.relatedEntityId;
  }

  get relatedEntityType(): string | undefined {
    return this.props.relatedEntityType;
  }

  get isRead(): boolean {
    return this.props.isRead;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get readAt(): Date | undefined {
    return this.props.readAt;
  }

  get version(): number {
    return this.props.version;
  }

  /**
   * Mark notification as read
   */
  markAsRead(): void {
    if (this.props.isRead) {
      throw new ValidationError('Notification is already marked as read');
    }

    this.props.isRead = true;
    this.props.readAt = new Date();
    this.props.version++;
  }

  /**
   * Mark notification as unread
   */
  markAsUnread(): void {
    if (!this.props.isRead) {
      throw new ValidationError('Notification is already marked as unread');
    }

    this.props.isRead = false;
    this.props.readAt = undefined;
    this.props.version++;
  }

  /**
   * Check if notification is task-related
   */
  isTaskRelated(): boolean {
    return this.props.type.isTaskRelated();
  }

  /**
   * Check if notification is team-related
   */
  isTeamRelated(): boolean {
    return this.props.type.isTeamRelated();
  }

  /**
   * Check if notification is project-related
   */
  isProjectRelated(): boolean {
    return this.props.type.isProjectRelated();
  }
}
