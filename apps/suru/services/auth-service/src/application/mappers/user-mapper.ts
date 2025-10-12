/**
 * User Mapper - Converts User and Session entities to DTOs
 */

import type { Session } from '../../domain/entities/session';
import type { User } from '../../domain/entities/user';

export interface UserDTO {
  id: string;
  email: string;
  displayName?: string;
  avatarUrl?: string;
  isActive: boolean;
  isEmailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  version: number;
}

export interface SessionDTO {
  id: string;
  userId: string;
  refreshToken: string;
  expiresAt: Date;
  isRevoked: boolean;
  createdAt: Date;
  updatedAt: Date;
  version: number;
}

export interface OAuthTokensDTO {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;
}

export interface UserClaimsDTO {
  userId: string;
  email: string;
  teamIds: string[];
  exp: number;
}

export function userToDTO(user: User): UserDTO {
  return {
    id: user.id.toString(),
    email: user.email.toString(),
    displayName: undefined, // TODO: Add displayName to User entity
    avatarUrl: undefined, // TODO: Add avatarUrl to User entity
    isActive: user.isActive,
    isEmailVerified: user.isEmailVerified,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    version: user.version,
  };
}

export function sessionToDTO(session: Session): SessionDTO {
  return {
    id: session.id.toString(),
    userId: session.userId.toString(),
    refreshToken: session.refreshToken.toString(),
    expiresAt: session.expiresAt,
    isRevoked: session.isRevoked,
    createdAt: session.createdAt,
    updatedAt: session.updatedAt,
    version: session.version,
  };
}
