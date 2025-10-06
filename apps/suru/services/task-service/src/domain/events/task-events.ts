/**
 * Task Domain Events
 */

export interface DomainEvent {
  eventType: string;
  occurredAt: Date;
  aggregateId: string;
}

export interface TaskCreatedEvent extends DomainEvent {
  eventType: 'TaskCreated';
  taskId: string;
  projectId: string;
  title: string;
  createdBy: string;
}

export interface TaskUpdatedEvent extends DomainEvent {
  eventType: 'TaskUpdated';
  taskId: string;
  changes: Record<string, unknown>;
}

export interface TaskStatusChangedEvent extends DomainEvent {
  eventType: 'TaskStatusChanged';
  taskId: string;
  oldStatus: string;
  newStatus: string;
}

export interface TaskAssignedEvent extends DomainEvent {
  eventType: 'TaskAssigned';
  taskId: string;
  assigneeId: string;
  assignedBy: string;
}

export interface TaskUnassignedEvent extends DomainEvent {
  eventType: 'TaskUnassigned';
  taskId: string;
  previousAssigneeId: string;
}

export interface SubtaskAddedEvent extends DomainEvent {
  eventType: 'SubtaskAdded';
  parentTaskId: string;
  subtaskId: string;
}

export interface TaskDeletedEvent extends DomainEvent {
  eventType: 'TaskDeleted';
  taskId: string;
  deletedBy: string;
}
