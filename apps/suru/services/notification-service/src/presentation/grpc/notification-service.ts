/**
 * Notification Service gRPC Server Implementation
 */

import { create } from '@bufbuild/protobuf';
import type { ConnectRouter } from '@connectrpc/connect';
import { Code, ConnectError } from '@connectrpc/connect';
import { NotificationService } from '@noos/suru-proto/dist/notification-service_connect';
import {
  type CreateNotificationRequest,
  type CreateNotificationResponse,
  CreateNotificationResponseSchema,
  type DeleteNotificationRequest,
  type DeleteNotificationResponse,
  DeleteNotificationResponseSchema,
  type ListNotificationsRequest,
  type ListNotificationsResponse,
  ListNotificationsResponseSchema,
  type MarkAllAsReadRequest,
  type MarkAllAsReadResponse,
  MarkAllAsReadResponseSchema,
  type MarkAsReadRequest,
  type MarkAsReadResponse,
  MarkAsReadResponseSchema,
  NotificationSchema,
  NotificationType,
  type SubscribePushRequest,
  type SubscribePushResponse,
  SubscribePushResponseSchema,
  type UnsubscribePushRequest,
  type UnsubscribePushResponse,
  UnsubscribePushResponseSchema,
  type WatchNotificationsRequest,
} from '@noos/suru-proto/dist/notification-service_pb';

import { CreateNotificationUseCase } from '../../application/use-cases/create-notification';
import { DeleteNotificationUseCase } from '../../application/use-cases/delete-notification';
import { GetNotificationUseCase } from '../../application/use-cases/get-notification';
import { ListNotificationsUseCase } from '../../application/use-cases/list-notifications';
import { MarkAllAsReadUseCase } from '../../application/use-cases/mark-all-as-read';
import { MarkAsReadUseCase } from '../../application/use-cases/mark-as-read';
import { SubscribePushUseCase } from '../../application/use-cases/subscribe-push';
import { UnsubscribePushUseCase } from '../../application/use-cases/unsubscribe-push';
import type { NotificationRepository } from '../../domain/repositories/notification-repository';

export class NotificationServiceHandler {
  private createNotificationUseCase: CreateNotificationUseCase;
  private listNotificationsUseCase: ListNotificationsUseCase;
  private markAsReadUseCase: MarkAsReadUseCase;
  private markAllAsReadUseCase: MarkAllAsReadUseCase;
  private deleteNotificationUseCase: DeleteNotificationUseCase;
  private getNotificationUseCase: GetNotificationUseCase;
  private subscribePushUseCase: SubscribePushUseCase;
  private unsubscribePushUseCase: UnsubscribePushUseCase;

  constructor(notificationRepository: NotificationRepository) {
    this.createNotificationUseCase = new CreateNotificationUseCase(notificationRepository);
    this.listNotificationsUseCase = new ListNotificationsUseCase(notificationRepository);
    this.markAsReadUseCase = new MarkAsReadUseCase(notificationRepository);
    this.markAllAsReadUseCase = new MarkAllAsReadUseCase(notificationRepository);
    this.deleteNotificationUseCase = new DeleteNotificationUseCase(notificationRepository);
    this.getNotificationUseCase = new GetNotificationUseCase(notificationRepository);
    this.subscribePushUseCase = new SubscribePushUseCase();
    this.unsubscribePushUseCase = new UnsubscribePushUseCase();
  }

  registerRoutes(router: ConnectRouter): void {
    router.service(NotificationService, {
      createNotification: async (
        req: CreateNotificationRequest,
      ): Promise<CreateNotificationResponse> => {
        try {
          const result = await this.createNotificationUseCase.execute({
            userId: req.userId,
            type: this.mapNotificationTypeFromProto(req.type),
            title: req.message, // Using message as title for simplicity
            message: req.message,
            relatedEntityId: req.taskId,
            relatedEntityType: req.taskId ? 'task' : undefined,
          });

          // Get the created notification to return full details
          const notification = await this.getNotificationUseCase.execute({
            notificationId: result.notificationId,
          });

          return create(CreateNotificationResponseSchema, {
            notification: create(NotificationSchema, {
              id: notification.notification.id,
              userId: notification.notification.userId,
              type: this.mapNotificationTypeToProto(notification.notification.type),
              message: notification.notification.message,
              taskId: notification.notification.relatedEntityId,
              taskSummary: undefined, // TODO: Fetch task summary from task service
              readAt: notification.notification.readAt?.toISOString(),
              deliveredAt: undefined, // TODO: Implement delivery tracking
              createdAt: notification.notification.createdAt.toISOString(),
            }),
          });
        } catch (error) {
          throw new ConnectError(
            error instanceof Error ? error.message : 'Failed to create notification',
            Code.Internal,
          );
        }
      },

      listNotifications: async (
        req: ListNotificationsRequest,
      ): Promise<ListNotificationsResponse> => {
        try {
          const page = req.page || 1;
          const pageSize = req.pageSize || 20;
          const offset = (page - 1) * pageSize;

          const result = await this.listNotificationsUseCase.execute({
            userId: req.userId,
            isRead: req.unreadOnly ? false : undefined,
            limit: pageSize,
            offset,
          });

          // Count unread notifications
          const unreadResult = await this.listNotificationsUseCase.execute({
            userId: req.userId,
            isRead: false,
            limit: 1000, // Large limit to count all
            offset: 0,
          });

          return create(ListNotificationsResponseSchema, {
            notifications: result.notifications.map((notification) =>
              create(NotificationSchema, {
                id: notification.id,
                userId: notification.userId,
                type: this.mapNotificationTypeToProto(notification.type),
                message: notification.message,
                taskId: notification.relatedEntityId,
                taskSummary: undefined, // TODO: Fetch task summary from task service
                readAt: notification.readAt?.toISOString(),
                deliveredAt: undefined, // TODO: Implement delivery tracking
                createdAt: notification.createdAt.toISOString(),
              }),
            ),
            totalCount: result.totalCount,
            unreadCount: unreadResult.notifications.length,
          });
        } catch (error) {
          throw new ConnectError(
            error instanceof Error ? error.message : 'Failed to list notifications',
            Code.Internal,
          );
        }
      },

      markAsRead: async (req: MarkAsReadRequest): Promise<MarkAsReadResponse> => {
        try {
          await this.markAsReadUseCase.execute({
            notificationId: req.notificationId,
          });

          // Get the updated notification
          const notification = await this.getNotificationUseCase.execute({
            notificationId: req.notificationId,
          });

          return create(MarkAsReadResponseSchema, {
            notification: create(NotificationSchema, {
              id: notification.notification.id,
              userId: notification.notification.userId,
              type: this.mapNotificationTypeToProto(notification.notification.type),
              message: notification.notification.message,
              taskId: notification.notification.relatedEntityId,
              taskSummary: undefined,
              readAt: notification.notification.readAt?.toISOString(),
              deliveredAt: undefined,
              createdAt: notification.notification.createdAt.toISOString(),
            }),
          });
        } catch (error) {
          if (error instanceof Error && error.message.includes('not found')) {
            throw new ConnectError(error.message, Code.NotFound);
          }
          throw new ConnectError(
            error instanceof Error ? error.message : 'Failed to mark notification as read',
            Code.Internal,
          );
        }
      },

      markAllAsRead: async (req: MarkAllAsReadRequest): Promise<MarkAllAsReadResponse> => {
        try {
          const result = await this.markAllAsReadUseCase.execute({
            userId: req.userId,
          });

          return create(MarkAllAsReadResponseSchema, {
            count: result.count,
          });
        } catch (error) {
          throw new ConnectError(
            error instanceof Error ? error.message : 'Failed to mark all as read',
            Code.Internal,
          );
        }
      },

      deleteNotification: async (
        req: DeleteNotificationRequest,
      ): Promise<DeleteNotificationResponse> => {
        try {
          const result = await this.deleteNotificationUseCase.execute({
            notificationId: req.notificationId,
          });

          return create(DeleteNotificationResponseSchema, {
            success: result.success,
          });
        } catch (error) {
          if (error instanceof Error && error.message.includes('not found')) {
            throw new ConnectError(error.message, Code.NotFound);
          }
          throw new ConnectError(
            error instanceof Error ? error.message : 'Failed to delete notification',
            Code.Internal,
          );
        }
      },

      subscribePush: async (req: SubscribePushRequest): Promise<SubscribePushResponse> => {
        try {
          const result = await this.subscribePushUseCase.execute({
            userId: req.userId,
            deviceToken: req.deviceToken,
            platform: this.mapDevicePlatformFromProto(req.platform),
          });

          return create(SubscribePushResponseSchema, {
            success: result.success,
          });
        } catch (error) {
          throw new ConnectError(
            error instanceof Error ? error.message : 'Failed to subscribe to push notifications',
            Code.Internal,
          );
        }
      },

      unsubscribePush: async (req: UnsubscribePushRequest): Promise<UnsubscribePushResponse> => {
        try {
          const result = await this.unsubscribePushUseCase.execute({
            userId: req.userId,
            deviceToken: req.deviceToken,
          });

          return create(UnsubscribePushResponseSchema, {
            success: result.success,
          });
        } catch (error) {
          throw new ConnectError(
            error instanceof Error
              ? error.message
              : 'Failed to unsubscribe from push notifications',
            Code.Internal,
          );
        }
      },

      watchNotifications: async (req: WatchNotificationsRequest) => {
        // TODO: Implement real-time streaming with WebSocket or Server-Sent Events
        // This would require setting up a pub/sub mechanism to stream new notifications
        throw new ConnectError(
          'Real-time notification streaming not implemented yet',
          Code.Unimplemented,
        );
      },
    });
  }

  private mapNotificationTypeToProto(type: string): NotificationType {
    switch (type) {
      case 'TASK_ASSIGNED':
        return NotificationType.TASK_ASSIGNED;
      case 'TASK_MENTIONED':
        return NotificationType.TASK_MENTIONED;
      case 'DUE_DATE_REMINDER':
        return NotificationType.DUE_DATE_REMINDER;
      case 'TASK_UPDATED':
        return NotificationType.TASK_UPDATED;
      default:
        return NotificationType.TASK_ASSIGNED;
    }
  }

  private mapNotificationTypeFromProto(type: NotificationType): string {
    switch (type) {
      case NotificationType.TASK_ASSIGNED:
        return 'TASK_ASSIGNED';
      case NotificationType.TASK_MENTIONED:
        return 'TASK_MENTIONED';
      case NotificationType.DUE_DATE_REMINDER:
        return 'DUE_DATE_REMINDER';
      case NotificationType.TASK_UPDATED:
        return 'TASK_UPDATED';
      default:
        return 'TASK_ASSIGNED';
    }
  }

  private mapDevicePlatformFromProto(platform: number): 'WEB' | 'IOS' | 'ANDROID' {
    switch (platform) {
      case 0:
        return 'WEB';
      case 1:
        return 'IOS';
      case 2:
        return 'ANDROID';
      default:
        return 'WEB';
    }
  }
}
