/**
 * Create Notification Use Case
 */

import { Notification } from '../../domain/entities/notification';
import type { NotificationRepository } from '../../domain/repositories';

export interface CreateNotificationInput {
	userId: string;
	type: string;
	title: string;
	message: string;
	relatedEntityId?: string;
	relatedEntityType?: string;
}

export interface CreateNotificationOutput {
	notificationId: string;
}

export class CreateNotificationUseCase {
	constructor(private notificationRepository: NotificationRepository) {}

	async execute(
		input: CreateNotificationInput,
	): Promise<CreateNotificationOutput> {
		const notification = Notification.create({
			userId: input.userId,
			type: input.type,
			title: input.title,
			message: input.message,
			relatedEntityId: input.relatedEntityId,
			relatedEntityType: input.relatedEntityType,
		});

		await this.notificationRepository.save(notification);

		return {
			notificationId: notification.id,
		};
	}
}
