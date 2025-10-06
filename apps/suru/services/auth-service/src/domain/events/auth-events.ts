/**
 * Auth Service Domain Events
 */

import { DomainEvent } from '@noos/suru-types';

/**
 * User registered event
 */
export interface UserRegisteredEvent extends DomainEvent {
  eventType: 'UserRegistered';
  userId: string;
  email: string;
}

/**
 * User logged in event
 */
export interface UserLoggedInEvent extends DomainEvent {
  eventType: 'UserLoggedIn';
  userId: string;
  sessionId: string;
}

/**
 * User logged out event
 */
export interface UserLoggedOutEvent extends DomainEvent {
  eventType: 'UserLoggedOut';
  userId: string;
  sessionId: string;
}

/**
 * Session created event
 */
export interface SessionCreatedEvent extends DomainEvent {
  eventType: 'SessionCreated';
  sessionId: string;
  userId: string;
  expiresAt: Date;
}

/**
 * Session revoked event
 */
export interface SessionRevokedEvent extends DomainEvent {
  eventType: 'SessionRevoked';
  sessionId: string;
  userId: string;
}

/**
 * Password changed event
 */
export interface PasswordChangedEvent extends DomainEvent {
  eventType: 'PasswordChanged';
  userId: string;
}

/**
 * Email verified event
 */
export interface EmailVerifiedEvent extends DomainEvent {
  eventType: 'EmailVerified';
  userId: string;
  email: string;
}

/**
 * Email changed event
 */
export interface EmailChangedEvent extends DomainEvent {
  eventType: 'EmailChanged';
  userId: string;
  oldEmail: string;
  newEmail: string;
}

/**
 * User deactivated event
 */
export interface UserDeactivatedEvent extends DomainEvent {
  eventType: 'UserDeactivated';
  userId: string;
}

/**
 * User reactivated event
 */
export interface UserReactivatedEvent extends DomainEvent {
  eventType: 'UserReactivated';
  userId: string;
}

/**
 * Session refreshed event
 */
export interface SessionRefreshedEvent extends DomainEvent {
  eventType: 'SessionRefreshed';
  sessionId: string;
  userId: string;
  expiresAt: Date;
}

/**
 * Union type of all auth events
 */
export type AuthEvent =
  | UserRegisteredEvent
  | UserLoggedInEvent
  | UserLoggedOutEvent
  | SessionCreatedEvent
  | SessionRevokedEvent
  | PasswordChangedEvent
  | EmailVerifiedEvent
  | EmailChangedEvent
  | UserDeactivatedEvent
  | UserReactivatedEvent
  | SessionRefreshedEvent;
