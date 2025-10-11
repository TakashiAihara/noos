/**
 * Mark All As Read Use Case
 */

import type { NotificationRepository } from '../../domain/repositories';

export interface MarkAllAsReadInput {
  userId: string;
}

export interface MarkAllAsReadOutput {
  count: number;
}

export class MarkAllAsReadUseCase {
  constructor(private notificationRepository: NotificationRepository) {}

  async execute(input: MarkAllAsReadInput): Promise<MarkAllAsReadOutput> {
    // Get all unread notifications for the user
    const unreadNotifications = await this.notificationRepository.findUnreadByUserId(input.userId);

    // Mark each as read
    for (const notification of unreadNotifications) {
      notification.markAsRead();
      await this.notificationRepository.save(notification);
    }

    return {
      count: unreadNotifications.length,
    };
  }
}
