/**
 * Contract tests for Notification Service gRPC interface
 */

import { describe, it, expect } from 'vitest';
import { createPromiseClient } from '@connectrpc/connect';
import { createGrpcTransport } from '@connectrpc/connect-node';
import { NotificationService } from '@noos/suru-proto';
import type {
  ListNotificationsRequest,
  MarkAsReadRequest,
  SubscribePushRequest,
  CreateNotificationRequest,
} from '@noos/suru-proto';

const TEST_PORT = 50054;
const transport = createGrpcTransport({
  baseUrl: `http://localhost:${TEST_PORT}`,
  httpVersion: '2',
});

const client = createPromiseClient(NotificationService, transport);

describe('Notification Service Contract', () => {
  describe('ListNotifications', () => {
    it('should list notifications with pagination', async () => {
      const request: ListNotificationsRequest = {
        userId: '123e4567-e89b-12d3-a456-426614174000',
        unreadOnly: false,
        page: 1,
        pageSize: 10,
      };

      const response = await client.listNotifications(request);

      expect(response.notifications).toBeDefined();
      expect(response.totalCount).toBeGreaterThanOrEqual(0);
      expect(response.unreadCount).toBeGreaterThanOrEqual(0);
    });

    it('should filter unread notifications only', async () => {
      const request: ListNotificationsRequest = {
        userId: '123e4567-e89b-12d3-a456-426614174000',
        unreadOnly: true,
        page: 1,
        pageSize: 10,
      };

      const response = await client.listNotifications(request);

      response.notifications.forEach(notification => {
        expect(notification.readAt).toBeUndefined();
      });
    });
  });

  describe('MarkAsRead', () => {
    it('should mark notification as read', async () => {
      const request: MarkAsReadRequest = {
        notificationId: '123e4567-e89b-12d3-a456-426614174050',
      };

      const response = await client.markAsRead(request);

      expect(response.notification).toBeDefined();
      expect(response.notification?.readAt).toBeDefined();
    });
  });

  describe('SubscribePush', () => {
    it('should subscribe web device for push notifications', async () => {
      const request: SubscribePushRequest = {
        userId: '123e4567-e89b-12d3-a456-426614174000',
        deviceToken: 'web-push-subscription-token',
        platform: 'WEB',
      };

      const response = await client.subscribePush(request);

      expect(response.success).toBe(true);
    });

    it('should subscribe mobile device for push notifications', async () => {
      const request: SubscribePushRequest = {
        userId: '123e4567-e89b-12d3-a456-426614174000',
        deviceToken: 'fcm-device-token',
        platform: 'ANDROID',
      };

      const response = await client.subscribePush(request);

      expect(response.success).toBe(true);
    });
  });

  describe('CreateNotification (internal)', () => {
    it('should create task assignment notification', async () => {
      const request: CreateNotificationRequest = {
        userId: '123e4567-e89b-12d3-a456-426614174001',
        type: 'TASK_ASSIGNED',
        message: 'You were assigned to task "Implement feature X"',
        taskId: '123e4567-e89b-12d3-a456-426614174002',
      };

      const response = await client.createNotification(request);

      expect(response.notification).toBeDefined();
      expect(response.notification?.type).toBe('TASK_ASSIGNED');
      expect(response.notification?.taskId).toBe('123e4567-e89b-12d3-a456-426614174002');
    });

    it('should create due date reminder notification', async () => {
      const request: CreateNotificationRequest = {
        userId: '123e4567-e89b-12d3-a456-426614174001',
        type: 'DUE_DATE_REMINDER',
        message: 'Task "Feature X" is due tomorrow',
        taskId: '123e4567-e89b-12d3-a456-426614174002',
        scheduledFor: '2025-10-07T09:00:00Z',
      };

      const response = await client.createNotification(request);

      expect(response.notification?.scheduledFor).toBe('2025-10-07T09:00:00Z');
    });
  });
});
