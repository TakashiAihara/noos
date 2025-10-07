/**
 * Notification Service Domain Events
 */

import { DomainEvent } from '@noos/suru-types';

/**
 * Notification created event
 */
export interface NotificationCreatedEvent extends DomainEvent {
	eventType: 'NotificationCreated';
	notificationId: string;
	userId: string;
	type: string;
	title: string;
}

/**
 * Notification read event
 */
export interface NotificationReadEvent extends DomainEvent {
	eventType: 'NotificationRead';
	notificationId: string;
	userId: string;
	readAt: Date;
}

/**
 * Notification deleted event
 */
export interface NotificationDeletedEvent extends DomainEvent {
	eventType: 'NotificationDeleted';
	notificationId: string;
	userId: string;
}

/**
 * Union type of all notification events
 */
export type NotificationEvent =
	| NotificationCreatedEvent
	| NotificationReadEvent
	| NotificationDeletedEvent;
