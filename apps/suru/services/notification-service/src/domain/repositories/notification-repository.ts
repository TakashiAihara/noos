/**
 * Notification Repository Interface
 */

import { Notification } from '../entities/notification';
import { NotificationId } from '../value-objects/notification-id';

export interface NotificationFilters {
  userId?: string;
  type?: string;
  isRead?: boolean;
  createdAfter?: Date;
  createdBefore?: Date;
  limit?: number;
  offset?: number;
}

export interface NotificationRepository {
  /**
   * Save a notification (create or update)
   */
  save(notification: Notification): Promise<void>;

  /**
   * Find a notification by ID
   */
  findById(id: NotificationId): Promise<Notification | null>;

  /**
   * Find all notifications for a user
   */
  findByUserId(userId: string): Promise<Notification[]>;

  /**
   * Find unread notifications for a user
   */
  findUnreadByUserId(userId: string): Promise<Notification[]>;

  /**
   * Find multiple notifications with filters
   */
  findMany(filters: NotificationFilters): Promise<{
    notifications: Notification[];
    totalCount: number;
  }>;

  /**
   * Delete a notification
   */
  delete(id: NotificationId): Promise<void>;

  /**
   * Delete all notifications for a user
   */
  deleteByUserId(userId: string): Promise<void>;

  /**
   * Mark multiple notifications as read
   */
  markManyAsRead(ids: NotificationId[]): Promise<void>;

  /**
   * Count unread notifications for a user
   */
  countUnread(userId: string): Promise<number>;

  /**
   * Check if a notification exists
   */
  exists(id: NotificationId): Promise<boolean>;
}
