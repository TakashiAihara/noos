/**
 * Session Entity
 */

import { ValidationError } from '@noos/suru-types';
import { SessionId } from '../value-objects/session-id';
import { UserId } from '../value-objects/user-id';
import { RefreshToken } from '../value-objects/refresh-token';

export interface SessionProps {
  id: SessionId;
  userId: UserId;
  refreshToken: RefreshToken;
  expiresAt: Date;
  isRevoked: boolean;
  createdAt: Date;
  updatedAt: Date;
  version: number;
}

export class Session {
  private props: SessionProps;

  private constructor(props: SessionProps) {
    this.props = props;
  }

  static create(params: {
    userId: string;
    refreshToken?: string;
    expiresInDays?: number;
  }): Session {
    const sessionId = SessionId.generate();
    const userId = UserId.create(params.userId);
    const refreshToken = params.refreshToken
      ? RefreshToken.create(params.refreshToken)
      : RefreshToken.generate();

    // Default expiration: 30 days
    const expiresInDays = params.expiresInDays ?? 30;
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiresInDays);

    return new Session({
      id: sessionId,
      userId,
      refreshToken,
      expiresAt,
      isRevoked: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      version: 1,
    });
  }

  static reconstitute(props: {
    id: string;
    userId: string;
    refreshToken: string;
    expiresAt: Date;
    isRevoked: boolean;
    createdAt: Date;
    updatedAt: Date;
    version: number;
  }): Session {
    return new Session({
      id: SessionId.create(props.id),
      userId: UserId.create(props.userId),
      refreshToken: RefreshToken.create(props.refreshToken),
      expiresAt: props.expiresAt,
      isRevoked: props.isRevoked,
      createdAt: props.createdAt,
      updatedAt: props.updatedAt,
      version: props.version,
    });
  }

  // Getters
  get id(): string {
    return this.props.id.toString();
  }

  get userId(): string {
    return this.props.userId.toString();
  }

  get refreshToken(): string {
    return this.props.refreshToken.toString();
  }

  get expiresAt(): Date {
    return this.props.expiresAt;
  }

  get isRevoked(): boolean {
    return this.props.isRevoked;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  get version(): number {
    return this.props.version;
  }

  /**
   * Check if session is valid
   */
  isValid(): boolean {
    return !this.props.isRevoked && this.props.expiresAt > new Date();
  }

  /**
   * Check if session is expired
   */
  isExpired(): boolean {
    return this.props.expiresAt <= new Date();
  }

  /**
   * Revoke session
   */
  revoke(): void {
    if (this.props.isRevoked) {
      throw new ValidationError('Session is already revoked');
    }

    this.props.isRevoked = true;
    this.props.updatedAt = new Date();
    this.props.version++;
  }

  /**
   * Refresh the session with a new token and expiration
   */
  refresh(params?: { expiresInDays?: number }): void {
    if (this.props.isRevoked) {
      throw new ValidationError('Cannot refresh revoked session');
    }

    if (this.isExpired()) {
      throw new ValidationError('Cannot refresh expired session');
    }

    // Generate new refresh token
    this.props.refreshToken = RefreshToken.generate();

    // Update expiration
    const expiresInDays = params?.expiresInDays ?? 30;
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiresInDays);
    this.props.expiresAt = expiresAt;

    this.props.updatedAt = new Date();
    this.props.version++;
  }
}
