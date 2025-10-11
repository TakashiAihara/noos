/**
 * Get Notification Use Case
 */

import { ValidationError } from '@noos/suru-types';
import type { NotificationRepository } from '../../domain/repositories';
import { NotificationId } from '../../domain/value-objects/notification-id';
import { type NotificationDTO, notificationToDTO } from '../mappers/notification-mapper';

export interface GetNotificationInput {
  notificationId: string;
}

export interface GetNotificationOutput {
  notification: NotificationDTO;
}

export class GetNotificationUseCase {
  constructor(private notificationRepository: NotificationRepository) {}

  async execute(input: GetNotificationInput): Promise<GetNotificationOutput> {
    const notificationId = NotificationId.create(input.notificationId);

    const notification = await this.notificationRepository.findById(notificationId);

    if (!notification) {
      throw new ValidationError('Notification not found');
    }

    return {
      notification: notificationToDTO(notification),
    };
  }
}
