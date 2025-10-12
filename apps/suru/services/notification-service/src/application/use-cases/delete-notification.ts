/**
 * Delete Notification Use Case
 */

import { ValidationError } from '@noos/suru-types';
import type { NotificationRepository } from '../../domain/repositories';
import { NotificationId } from '../../domain/value-objects/notification-id';

export interface DeleteNotificationInput {
  notificationId: string;
}

export interface DeleteNotificationOutput {
  success: boolean;
}

export class DeleteNotificationUseCase {
  constructor(private notificationRepository: NotificationRepository) {}

  async execute(input: DeleteNotificationInput): Promise<DeleteNotificationOutput> {
    const notificationId = NotificationId.create(input.notificationId);

    const exists = await this.notificationRepository.exists(notificationId);

    if (!exists) {
      throw new ValidationError('Notification not found');
    }

    await this.notificationRepository.delete(notificationId);

    return {
      success: true,
    };
  }
}
