/**
 * Domain-level type definitions
 */

// Primitive value objects
export type UUID = string;
export type Timestamp = string; // ISO 8601
export type Email = string;

// Task domain
export enum TaskStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  DONE = 'DONE',
}

export enum Priority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
}

// Team domain
export enum TeamRole {
  OWNER = 'OWNER',
  ADMIN = 'ADMIN',
  MEMBER = 'MEMBER',
}

// Auth domain
export enum OAuthProvider {
  GOOGLE = 'GOOGLE',
  GITHUB = 'GITHUB',
}

// Notification domain
export enum NotificationType {
  TASK_ASSIGNED = 'TASK_ASSIGNED',
  TASK_MENTIONED = 'TASK_MENTIONED',
  DUE_DATE_REMINDER = 'DUE_DATE_REMINDER',
  TASK_UPDATED = 'TASK_UPDATED',
}
