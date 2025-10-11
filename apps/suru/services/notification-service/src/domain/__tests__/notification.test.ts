/**
 * Notification Entity Tests
 */

import { describe, expect, it } from 'vitest';
import { Notification } from '../entities/notification';
import { NotificationTypeEnum } from '../value-objects/notification-type';

const VALID_USER_ID = '123e4567-e89b-42d3-a456-426614174000';

describe('Notification Entity', () => {
  describe('create', () => {
    it('should create a new notification with valid data', () => {
      const notification = Notification.create({
        userId: VALID_USER_ID,
        type: NotificationTypeEnum.TASK_ASSIGNED,
        title: 'New task assigned',
        message: 'You have been assigned to task #123',
      });

      expect(notification.id).toBeDefined();
      expect(notification.userId).toBe(VALID_USER_ID);
      expect(notification.type).toBe(NotificationTypeEnum.TASK_ASSIGNED);
      expect(notification.title).toBe('New task assigned');
      expect(notification.message).toBe('You have been assigned to task #123');
      expect(notification.isRead).toBe(false);
      expect(notification.version).toBe(1);
    });

    it('should trim title and message', () => {
      const notification = Notification.create({
        userId: VALID_USER_ID,
        type: NotificationTypeEnum.TASK_ASSIGNED,
        title: '  Title with spaces  ',
        message: '  Message with spaces  ',
      });

      expect(notification.title).toBe('Title with spaces');
      expect(notification.message).toBe('Message with spaces');
    });

    it('should include related entity info when provided', () => {
      const notification = Notification.create({
        userId: VALID_USER_ID,
        type: NotificationTypeEnum.TASK_ASSIGNED,
        title: 'New task assigned',
        message: 'You have been assigned to task #123',
        relatedEntityId: 'task-123',
        relatedEntityType: 'Task',
      });

      expect(notification.relatedEntityId).toBe('task-123');
      expect(notification.relatedEntityType).toBe('Task');
    });

    it('should reject empty title', () => {
      expect(() =>
        Notification.create({
          userId: VALID_USER_ID,
          type: NotificationTypeEnum.TASK_ASSIGNED,
          title: '',
          message: 'Valid message',
        }),
      ).toThrow('Notification title is required');
    });

    it('should reject empty message', () => {
      expect(() =>
        Notification.create({
          userId: VALID_USER_ID,
          type: NotificationTypeEnum.TASK_ASSIGNED,
          title: 'Valid title',
          message: '',
        }),
      ).toThrow('Notification message is required');
    });

    it('should reject title longer than 200 characters', () => {
      expect(() =>
        Notification.create({
          userId: VALID_USER_ID,
          type: NotificationTypeEnum.TASK_ASSIGNED,
          title: 'a'.repeat(201),
          message: 'Valid message',
        }),
      ).toThrow('Notification title must be less than 200 characters');
    });

    it('should reject message longer than 1000 characters', () => {
      expect(() =>
        Notification.create({
          userId: VALID_USER_ID,
          type: NotificationTypeEnum.TASK_ASSIGNED,
          title: 'Valid title',
          message: 'a'.repeat(1001),
        }),
      ).toThrow('Notification message must be less than 1000 characters');
    });

    it('should reject invalid notification type', () => {
      expect(() =>
        Notification.create({
          userId: VALID_USER_ID,
          type: 'INVALID_TYPE',
          title: 'Valid title',
          message: 'Valid message',
        }),
      ).toThrow('Invalid notification type: INVALID_TYPE');
    });
  });

  describe('markAsRead', () => {
    it('should mark notification as read', () => {
      const notification = Notification.create({
        userId: VALID_USER_ID,
        type: NotificationTypeEnum.TASK_ASSIGNED,
        title: 'Test notification',
        message: 'Test message',
      });

      const oldVersion = notification.version;

      notification.markAsRead();

      expect(notification.isRead).toBe(true);
      expect(notification.readAt).toBeDefined();
      expect(notification.version).toBe(oldVersion + 1);
    });

    it('should reject marking already read notification', () => {
      const notification = Notification.create({
        userId: VALID_USER_ID,
        type: NotificationTypeEnum.TASK_ASSIGNED,
        title: 'Test notification',
        message: 'Test message',
      });

      notification.markAsRead();

      expect(() => notification.markAsRead()).toThrow('Notification is already marked as read');
    });
  });

  describe('markAsUnread', () => {
    it('should mark notification as unread', () => {
      const notification = Notification.create({
        userId: VALID_USER_ID,
        type: NotificationTypeEnum.TASK_ASSIGNED,
        title: 'Test notification',
        message: 'Test message',
      });

      notification.markAsRead();
      const oldVersion = notification.version;

      notification.markAsUnread();

      expect(notification.isRead).toBe(false);
      expect(notification.readAt).toBeUndefined();
      expect(notification.version).toBe(oldVersion + 1);
    });

    it('should reject marking already unread notification', () => {
      const notification = Notification.create({
        userId: VALID_USER_ID,
        type: NotificationTypeEnum.TASK_ASSIGNED,
        title: 'Test notification',
        message: 'Test message',
      });

      expect(() => notification.markAsUnread()).toThrow('Notification is already marked as unread');
    });
  });

  describe('type helpers', () => {
    it('should identify task-related notifications', () => {
      const notification = Notification.create({
        userId: VALID_USER_ID,
        type: NotificationTypeEnum.TASK_ASSIGNED,
        title: 'Test',
        message: 'Test',
      });

      expect(notification.isTaskRelated()).toBe(true);
      expect(notification.isTeamRelated()).toBe(false);
      expect(notification.isProjectRelated()).toBe(false);
    });

    it('should identify team-related notifications', () => {
      const notification = Notification.create({
        userId: VALID_USER_ID,
        type: NotificationTypeEnum.TEAM_INVITATION,
        title: 'Test',
        message: 'Test',
      });

      expect(notification.isTaskRelated()).toBe(false);
      expect(notification.isTeamRelated()).toBe(true);
      expect(notification.isProjectRelated()).toBe(false);
    });

    it('should identify project-related notifications', () => {
      const notification = Notification.create({
        userId: VALID_USER_ID,
        type: NotificationTypeEnum.PROJECT_CREATED,
        title: 'Test',
        message: 'Test',
      });

      expect(notification.isTaskRelated()).toBe(false);
      expect(notification.isTeamRelated()).toBe(false);
      expect(notification.isProjectRelated()).toBe(true);
    });
  });

  describe('reconstitute', () => {
    it('should reconstitute notification from persistence', () => {
      const props = {
        id: '123e4567-e89b-42d3-a456-426614174001',
        userId: VALID_USER_ID,
        type: NotificationTypeEnum.TASK_ASSIGNED,
        title: 'Test notification',
        message: 'Test message',
        relatedEntityId: 'task-123',
        relatedEntityType: 'Task',
        isRead: true,
        createdAt: new Date('2024-01-01'),
        readAt: new Date('2024-01-02'),
        version: 2,
      };

      const notification = Notification.reconstitute(props);

      expect(notification.id).toBe(props.id);
      expect(notification.userId).toBe(props.userId);
      expect(notification.type).toBe(props.type);
      expect(notification.isRead).toBe(props.isRead);
      expect(notification.version).toBe(props.version);
    });
  });
});
