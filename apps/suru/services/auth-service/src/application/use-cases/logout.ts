/**
 * Logout Use Case
 */

import type { SessionRepository } from '../../domain/repositories/session-repository';
import { RefreshToken } from '../../domain/value-objects/refresh-token';

export interface LogoutInput {
  accessToken: string;
  refreshToken: string;
}

export interface LogoutOutput {
  success: boolean;
}

export class LogoutUseCase {
  constructor(private sessionRepository: SessionRepository) {}

  async execute(input: LogoutInput): Promise<LogoutOutput> {
    try {
      // TODO: Invalidate access token (add to blacklist or revoke in token service)

      // Revoke session by refresh token
      const refreshToken = RefreshToken.create(input.refreshToken);
      const session = await this.sessionRepository.findByRefreshToken(refreshToken);

      if (session) {
        session.revoke();
        await this.sessionRepository.save(session);
      }

      return { success: true };
    } catch (error) {
      // Even if there's an error, we consider logout successful
      // to prevent client-side token from being reused
      return { success: true };
    }
  }
}
