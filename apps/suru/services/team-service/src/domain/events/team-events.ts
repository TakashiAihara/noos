/**
 * Team Domain Events
 */

export interface DomainEvent {
	eventType: string;
	occurredAt: Date;
	aggregateId: string;
}

export interface TeamCreatedEvent extends DomainEvent {
	eventType: 'TeamCreated';
	teamId: string;
	name: string;
	createdBy: string;
}

export interface TeamUpdatedEvent extends DomainEvent {
	eventType: 'TeamUpdated';
	teamId: string;
	name: string;
	description?: string;
}

export interface MemberAddedEvent extends DomainEvent {
	eventType: 'MemberAdded';
	teamId: string;
	userId: string;
	role: string;
	addedBy: string;
}

export interface MemberRemovedEvent extends DomainEvent {
	eventType: 'MemberRemoved';
	teamId: string;
	userId: string;
	removedBy: string;
}

export interface MemberRoleChangedEvent extends DomainEvent {
	eventType: 'MemberRoleChanged';
	teamId: string;
	userId: string;
	oldRole: string;
	newRole: string;
	changedBy: string;
}

export interface ProjectCreatedEvent extends DomainEvent {
	eventType: 'ProjectCreated';
	projectId: string;
	teamId: string;
	name: string;
	createdBy: string;
}

export interface ProjectArchivedEvent extends DomainEvent {
	eventType: 'ProjectArchived';
	projectId: string;
	teamId: string;
}

export interface ProjectUnarchivedEvent extends DomainEvent {
	eventType: 'ProjectUnarchived';
	projectId: string;
	teamId: string;
}

export type TeamDomainEvent =
	| TeamCreatedEvent
	| TeamUpdatedEvent
	| MemberAddedEvent
	| MemberRemovedEvent
	| MemberRoleChangedEvent
	| ProjectCreatedEvent
	| ProjectArchivedEvent
	| ProjectUnarchivedEvent;
