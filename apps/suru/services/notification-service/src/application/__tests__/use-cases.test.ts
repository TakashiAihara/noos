/**
 * Use Cases Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CreateNotificationUseCase } from '../use-cases/create-notification';
import { ListNotificationsUseCase } from '../use-cases/list-notifications';
import { MarkAsReadUseCase } from '../use-cases/mark-as-read';
import { Notification } from '../../domain/entities/notification';
import { NotificationId } from '../../domain/value-objects/notification-id';
import { NotificationTypeEnum } from '../../domain/value-objects/notification-type';
import type { NotificationRepository, NotificationFilters } from '../../domain/repositories';

const VALID_USER_ID = '123e4567-e89b-42d3-a456-426614174000';

// Mock Repository
class MockNotificationRepository implements NotificationRepository {
  private notifications: Map<string, Notification> = new Map();

  async save(notification: Notification): Promise<void> {
    this.notifications.set(notification.id, notification);
  }

  async findById(id: NotificationId): Promise<Notification | null> {
    return this.notifications.get(id.toString()) || null;
  }

  async findByUserId(userId: string): Promise<Notification[]> {
    return Array.from(this.notifications.values()).filter(
      (n) => n.userId === userId,
    );
  }

  async findUnreadByUserId(userId: string): Promise<Notification[]> {
    return Array.from(this.notifications.values()).filter(
      (n) => n.userId === userId && !n.isRead,
    );
  }

  async findMany(filters: NotificationFilters): Promise<{
    notifications: Notification[];
    totalCount: number;
  }> {
    let result = Array.from(this.notifications.values());

    if (filters.userId) {
      result = result.filter((n) => n.userId === filters.userId);
    }

    if (filters.type) {
      result = result.filter((n) => n.type === filters.type);
    }

    if (filters.isRead !== undefined) {
      result = result.filter((n) => n.isRead === filters.isRead);
    }

    const totalCount = result.length;

    if (filters.offset) {
      result = result.slice(filters.offset);
    }

    if (filters.limit) {
      result = result.slice(0, filters.limit);
    }

    return { notifications: result, totalCount };
  }

  async delete(_id: NotificationId): Promise<void> {
    // Not implemented for this test
  }

  async deleteByUserId(_userId: string): Promise<void> {
    // Not implemented for this test
  }

  async markManyAsRead(_ids: NotificationId[]): Promise<void> {
    // Not implemented for this test
  }

  async countUnread(userId: string): Promise<number> {
    return (await this.findUnreadByUserId(userId)).length;
  }

  async exists(id: NotificationId): Promise<boolean> {
    return this.notifications.has(id.toString());
  }
}

describe('Use Cases', () => {
  let repository: MockNotificationRepository;

  beforeEach(() => {
    repository = new MockNotificationRepository();
  });

  describe('CreateNotificationUseCase', () => {
    it('should create a notification successfully', async () => {
      const useCase = new CreateNotificationUseCase(repository);

      const result = await useCase.execute({
        userId: VALID_USER_ID,
        type: NotificationTypeEnum.TASK_ASSIGNED,
        title: 'New task assigned',
        message: 'You have been assigned to task #123',
        relatedEntityId: 'task-123',
        relatedEntityType: 'Task',
      });

      expect(result.notificationId).toBeDefined();

      const notification = await repository.findById(
        NotificationId.create(result.notificationId),
      );
      expect(notification).toBeDefined();
      expect(notification?.userId).toBe(VALID_USER_ID);
      expect(notification?.title).toBe('New task assigned');
    });

    it('should reject invalid input', async () => {
      const useCase = new CreateNotificationUseCase(repository);

      await expect(
        useCase.execute({
          userId: VALID_USER_ID,
          type: NotificationTypeEnum.TASK_ASSIGNED,
          title: '',
          message: 'Valid message',
        }),
      ).rejects.toThrow('Notification title is required');
    });
  });

  describe('ListNotificationsUseCase', () => {
    it('should list notifications for a user', async () => {
      // Create some notifications
      const notification1 = Notification.create({
        userId: VALID_USER_ID,
        type: NotificationTypeEnum.TASK_ASSIGNED,
        title: 'Notification 1',
        message: 'Message 1',
      });

      const notification2 = Notification.create({
        userId: VALID_USER_ID,
        type: NotificationTypeEnum.TASK_COMPLETED,
        title: 'Notification 2',
        message: 'Message 2',
      });

      await repository.save(notification1);
      await repository.save(notification2);

      const useCase = new ListNotificationsUseCase(repository);

      const result = await useCase.execute({
        userId: VALID_USER_ID,
      });

      expect(result.notifications).toHaveLength(2);
      expect(result.totalCount).toBe(2);
    });

    it('should filter by read status', async () => {
      const notification1 = Notification.create({
        userId: VALID_USER_ID,
        type: NotificationTypeEnum.TASK_ASSIGNED,
        title: 'Notification 1',
        message: 'Message 1',
      });

      const notification2 = Notification.create({
        userId: VALID_USER_ID,
        type: NotificationTypeEnum.TASK_COMPLETED,
        title: 'Notification 2',
        message: 'Message 2',
      });

      notification2.markAsRead();

      await repository.save(notification1);
      await repository.save(notification2);

      const useCase = new ListNotificationsUseCase(repository);

      const result = await useCase.execute({
        userId: VALID_USER_ID,
        isRead: false,
      });

      expect(result.notifications).toHaveLength(1);
      expect(result.notifications[0].title).toBe('Notification 1');
    });

    it('should support pagination', async () => {
      // Create 5 notifications
      for (let i = 0; i < 5; i++) {
        const notification = Notification.create({
          userId: VALID_USER_ID,
          type: NotificationTypeEnum.TASK_ASSIGNED,
          title: `Notification ${i}`,
          message: `Message ${i}`,
        });
        await repository.save(notification);
      }

      const useCase = new ListNotificationsUseCase(repository);

      const result = await useCase.execute({
        userId: VALID_USER_ID,
        limit: 2,
        offset: 1,
      });

      expect(result.notifications).toHaveLength(2);
      expect(result.totalCount).toBe(5);
    });
  });

  describe('MarkAsReadUseCase', () => {
    it('should mark notification as read', async () => {
      const notification = Notification.create({
        userId: VALID_USER_ID,
        type: NotificationTypeEnum.TASK_ASSIGNED,
        title: 'Test notification',
        message: 'Test message',
      });

      await repository.save(notification);

      const useCase = new MarkAsReadUseCase(repository);

      const result = await useCase.execute({
        notificationId: notification.id,
      });

      expect(result.success).toBe(true);

      const updated = await repository.findById(
        NotificationId.create(notification.id),
      );
      expect(updated?.isRead).toBe(true);
    });

    it('should throw error for non-existent notification', async () => {
      const useCase = new MarkAsReadUseCase(repository);

      await expect(
        useCase.execute({
          notificationId: '123e4567-e89b-42d3-a456-426614174999',
        }),
      ).rejects.toThrow('Notification not found');
    });

    it('should throw error when marking already read notification', async () => {
      const notification = Notification.create({
        userId: VALID_USER_ID,
        type: NotificationTypeEnum.TASK_ASSIGNED,
        title: 'Test notification',
        message: 'Test message',
      });

      notification.markAsRead();
      await repository.save(notification);

      const useCase = new MarkAsReadUseCase(repository);

      await expect(
        useCase.execute({
          notificationId: notification.id,
        }),
      ).rejects.toThrow('Notification is already marked as read');
    });
  });
});
