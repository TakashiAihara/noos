/**
 * Prisma Notification Repository Implementation
 */

import { PrismaClient } from '@noos/suru-db';
import { Notification } from '../../domain/entities/notification';
import type {
  NotificationFilters,
  NotificationRepository,
} from '../../domain/repositories/notification-repository';
import { NotificationId } from '../../domain/value-objects/notification-id';

export class PrismaNotificationRepository implements NotificationRepository {
  constructor(private prisma: PrismaClient) {}

  async save(notification: Notification): Promise<void> {
    const exists = await this.exists(NotificationId.create(notification.id));

    const data = {
      id: notification.id,
      userId: notification.userId,
      type: notification.type,
      message: notification.message,
      taskId: notification.relatedEntityType === 'Task' ? notification.relatedEntityId : null,
      readAt: notification.readAt,
    };

    if (exists) {
      await this.prisma.notification.update({
        where: { id: data.id },
        data: {
          ...data,
          createdAt: notification.createdAt,
        },
      });
    } else {
      await this.prisma.notification.create({
        data: {
          ...data,
          createdAt: notification.createdAt,
        },
      });
    }
  }

  async findById(id: NotificationId): Promise<Notification | null> {
    const notifData = await this.prisma.notification.findUnique({
      where: { id: id.toString() },
    });

    if (!notifData) {
      return null;
    }

    return Notification.reconstitute({
      id: notifData.id,
      userId: notifData.userId,
      type: notifData.type,
      title: 'Notification', // Default title
      message: notifData.message,
      relatedEntityId: notifData.taskId ?? undefined,
      relatedEntityType: notifData.taskId ? 'Task' : undefined,
      isRead: !!notifData.readAt,
      createdAt: notifData.createdAt,
      readAt: notifData.readAt ?? undefined,
      version: 1,
    });
  }

  async findByUserId(userId: string): Promise<Notification[]> {
    const notifications = await this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return notifications.map((n) =>
      Notification.reconstitute({
        id: n.id,
        userId: n.userId,
        type: n.type,
        title: 'Notification',
        message: n.message,
        relatedEntityId: n.taskId ?? undefined,
        relatedEntityType: n.taskId ? 'Task' : undefined,
        isRead: !!n.readAt,
        createdAt: n.createdAt,
        readAt: n.readAt ?? undefined,
        version: 1,
      }),
    );
  }

  async findUnreadByUserId(userId: string): Promise<Notification[]> {
    const notifications = await this.prisma.notification.findMany({
      where: {
        userId,
        readAt: null,
      },
      orderBy: { createdAt: 'desc' },
    });

    return notifications.map((n) =>
      Notification.reconstitute({
        id: n.id,
        userId: n.userId,
        type: n.type,
        title: 'Notification',
        message: n.message,
        relatedEntityId: n.taskId ?? undefined,
        relatedEntityType: n.taskId ? 'Task' : undefined,
        isRead: false,
        createdAt: n.createdAt,
        version: 1,
      }),
    );
  }

  async findMany(filters: NotificationFilters): Promise<{
    notifications: Notification[];
    totalCount: number;
  }> {
    const where = {
      ...(filters.userId && { userId: filters.userId }),
      ...(filters.type && { type: filters.type }),
      ...(filters.isRead !== undefined && {
        readAt: filters.isRead ? { not: null } : null,
      }),
    };

    const [notifications, totalCount] = await Promise.all([
      this.prisma.notification.findMany({
        where,
        skip: filters.offset,
        take: filters.limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.notification.count({ where }),
    ]);

    return {
      notifications: notifications.map((n) =>
        Notification.reconstitute({
          id: n.id,
          userId: n.userId,
          type: n.type,
          title: 'Notification',
          message: n.message,
          relatedEntityId: n.taskId ?? undefined,
          relatedEntityType: n.taskId ? 'Task' : undefined,
          isRead: !!n.readAt,
          createdAt: n.createdAt,
          readAt: n.readAt ?? undefined,
          version: 1,
        }),
      ),
      totalCount,
    };
  }

  async delete(id: NotificationId): Promise<void> {
    await this.prisma.notification.delete({
      where: { id: id.toString() },
    });
  }

  async deleteByUserId(userId: string): Promise<void> {
    await this.prisma.notification.deleteMany({
      where: { userId },
    });
  }

  async markManyAsRead(ids: NotificationId[]): Promise<void> {
    await this.prisma.notification.updateMany({
      where: {
        id: { in: ids.map((id) => id.toString()) },
      },
      data: {
        readAt: new Date(),
      },
    });
  }

  async countUnread(userId: string): Promise<number> {
    return await this.prisma.notification.count({
      where: {
        userId,
        readAt: null,
      },
    });
  }

  async exists(id: NotificationId): Promise<boolean> {
    const count = await this.prisma.notification.count({
      where: { id: id.toString() },
    });
    return count > 0;
  }
}
