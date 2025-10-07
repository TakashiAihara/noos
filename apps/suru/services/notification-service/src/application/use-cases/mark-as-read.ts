/**
 * Mark As Read Use Case
 */

import { NotificationId } from '../../domain/value-objects/notification-id';
import type { NotificationRepository } from '../../domain/repositories';
import { ValidationError } from '@noos/suru-types';

export interface MarkAsReadInput {
  notificationId: string;
}

export interface MarkAsReadOutput {
  success: boolean;
}

export class MarkAsReadUseCase {
  constructor(private notificationRepository: NotificationRepository) {}

  async execute(input: MarkAsReadInput): Promise<MarkAsReadOutput> {
    const notificationId = NotificationId.create(input.notificationId);

    const notification = await this.notificationRepository.findById(notificationId);

    if (!notification) {
      throw new ValidationError('Notification not found');
    }

    notification.markAsRead();

    await this.notificationRepository.save(notification);

    return {
      success: true,
    };
  }
}
