/**
 * Notification Mapper - Converts Notification entity to DTO
 */

import type { Notification } from '../../domain/entities/notification';

export interface NotificationDTO {
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
}

export function notificationToDTO(notification: Notification): NotificationDTO {
  return {
    id: notification.id,
    userId: notification.userId,
    type: notification.type,
    title: notification.title,
    message: notification.message,
    relatedEntityId: notification.relatedEntityId,
    relatedEntityType: notification.relatedEntityType,
    isRead: notification.isRead,
    createdAt: notification.createdAt,
    readAt: notification.readAt,
    version: notification.version,
  };
}
