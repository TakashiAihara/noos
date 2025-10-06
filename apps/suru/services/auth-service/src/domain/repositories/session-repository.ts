/**
 * Session Repository Interface
 */

import { Session } from '../entities/session';
import { SessionId } from '../value-objects/session-id';
import { UserId } from '../value-objects/user-id';
import { RefreshToken } from '../value-objects/refresh-token';

export interface SessionFilters {
  userId?: string;
  isRevoked?: boolean;
  isExpired?: boolean;
  createdAfter?: Date;
  createdBefore?: Date;
  limit?: number;
  offset?: number;
}

export interface SessionRepository {
  /**
   * Save a session (create or update)
   */
  save(session: Session): Promise<void>;

  /**
   * Find a session by ID
   */
  findById(id: SessionId): Promise<Session | null>;

  /**
   * Find a session by refresh token
   */
  findByRefreshToken(token: RefreshToken): Promise<Session | null>;

  /**
   * Find all sessions for a user
   */
  findByUserId(userId: UserId): Promise<Session[]>;

  /**
   * Find multiple sessions with filters
   */
  findMany(filters: SessionFilters): Promise<{
    sessions: Session[];
    totalCount: number;
  }>;

  /**
   * Delete a session
   */
  delete(id: SessionId): Promise<void>;

  /**
   * Delete all sessions for a user
   */
  deleteByUserId(userId: UserId): Promise<void>;

  /**
   * Delete expired sessions (cleanup)
   */
  deleteExpired(): Promise<number>;

  /**
   * Check if a session exists
   */
  exists(id: SessionId): Promise<boolean>;
}
