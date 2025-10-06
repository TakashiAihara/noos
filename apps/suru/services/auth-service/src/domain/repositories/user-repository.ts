/**
 * User Repository Interface
 */

import { User } from '../entities/user';
import { UserId } from '../value-objects/user-id';
import { Email } from '../value-objects/email';

export interface UserFilters {
  isActive?: boolean;
  isEmailVerified?: boolean;
  createdAfter?: Date;
  createdBefore?: Date;
  limit?: number;
  offset?: number;
}

export interface UserRepository {
  /**
   * Save a user (create or update)
   */
  save(user: User): Promise<void>;

  /**
   * Find a user by ID
   */
  findById(id: UserId): Promise<User | null>;

  /**
   * Find a user by email
   */
  findByEmail(email: Email): Promise<User | null>;

  /**
   * Find multiple users with filters
   */
  findMany(filters: UserFilters): Promise<{
    users: User[];
    totalCount: number;
  }>;

  /**
   * Delete a user
   */
  delete(id: UserId): Promise<void>;

  /**
   * Check if a user exists
   */
  exists(id: UserId): Promise<boolean>;

  /**
   * Check if an email is already registered
   */
  existsByEmail(email: Email): Promise<boolean>;
}
