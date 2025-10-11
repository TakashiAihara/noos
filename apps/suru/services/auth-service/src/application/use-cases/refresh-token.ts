/**
 * Refresh Token Use Case
 */

import type { SessionRepository } from '../../domain/repositories/session-repository';
import type { UserRepository } from '../../domain/repositories/user-repository';
import { RefreshToken } from '../../domain/value-objects/refresh-token';
import { UserId } from '../../domain/value-objects/user-id';
import { type OAuthTokensDTO } from '../mappers/user-mapper';

export interface RefreshTokenInput {
  refreshToken: string;
}

export interface RefreshTokenOutput {
  tokens: OAuthTokensDTO;
}

export class RefreshTokenUseCase {
  constructor(
    private sessionRepository: SessionRepository,
    private userRepository: UserRepository,
  ) {}

  async execute(input: RefreshTokenInput): Promise<RefreshTokenOutput> {
    // Find session by refresh token
    const refreshToken = RefreshToken.create(input.refreshToken);
    const session = await this.sessionRepository.findByRefreshToken(refreshToken);

    if (!session) {
      throw new Error('Invalid refresh token');
    }

    // Validate session
    if (!session.isValid()) {
      throw new Error('Session is invalid or expired');
    }

    // Get user
    const userId = UserId.create(session.userId.toString());
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new Error('User not found');
    }

    // Check if user can login
    if (!user.canLogin()) {
      throw new Error('User account is inactive');
    }

    // Refresh the session (generates new refresh token)
    session.refresh();
    await this.sessionRepository.save(session);

    // Generate new access token
    const accessToken = this.generateAccessToken(user.id.toString(), user.email.toString());

    return {
      tokens: {
        accessToken,
        refreshToken: session.refreshToken.toString(),
        expiresIn: 3600, // 1 hour in seconds
        tokenType: 'Bearer',
      },
    };
  }

  private generateAccessToken(userId: string, email: string): string {
    // TODO: Generate JWT access token with user claims
    // Should include: user_id, email, team_ids, exp

    return `jwt_token_${userId}`;
  }
}
