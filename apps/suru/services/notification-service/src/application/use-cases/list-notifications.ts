/**
 * List Notifications Use Case
 */

import type {
	NotificationRepository,
	NotificationFilters,
} from '../../domain/repositories';

export interface ListNotificationsInput {
	userId: string;
	type?: string;
	isRead?: boolean;
	limit?: number;
	offset?: number;
}

export interface NotificationDto {
	id: string;
	userId: string;
	type: string;
	title: string;
	message: string;
	relatedEntityId?: string;
	relatedEntityType?: string;
	isRead: boolean;
	createdAt: Date;
	readAt?: Date;
}

export interface ListNotificationsOutput {
	notifications: NotificationDto[];
	totalCount: number;
}

export class ListNotificationsUseCase {
	constructor(private notificationRepository: NotificationRepository) {}

	async execute(
		input: ListNotificationsInput,
	): Promise<ListNotificationsOutput> {
		const filters: NotificationFilters = {
			userId: input.userId,
			type: input.type,
			isRead: input.isRead,
			limit: input.limit,
			offset: input.offset,
		};

		const result = await this.notificationRepository.findMany(filters);

		return {
			notifications: result.notifications.map((notification) => ({
				id: notification.id,
				userId: notification.userId,
				type: notification.type,
				title: notification.title,
				message: notification.message,
				relatedEntityId: notification.relatedEntityId,
				relatedEntityType: notification.relatedEntityType,
				isRead: notification.isRead,
				createdAt: notification.createdAt,
				readAt: notification.readAt,
			})),
			totalCount: result.totalCount,
		};
	}
}
