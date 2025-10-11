/**
 * Handle OAuth Callback Use Case
 */

import { Session } from '../../domain/entities/session';
import { User } from '../../domain/entities/user';
import type { SessionRepository } from '../../domain/repositories/session-repository';
import type { UserRepository } from '../../domain/repositories/user-repository';
import { Email } from '../../domain/value-objects/email';
import { type OAuthTokensDTO, type UserDTO, sessionToDTO, userToDTO } from '../mappers/user-mapper';

export interface HandleOAuthCallbackInput {
  provider: 'GOOGLE' | 'GITHUB';
  code: string;
  state: string;
}

export interface HandleOAuthCallbackOutput {
  tokens: OAuthTokensDTO;
  user: UserDTO;
  isNewUser: boolean;
}

export class HandleOAuthCallbackUseCase {
  constructor(
    private userRepository: UserRepository,
    private sessionRepository: SessionRepository,
  ) {}

  async execute(input: HandleOAuthCallbackInput): Promise<HandleOAuthCallbackOutput> {
    // TODO: Implement OAuth callback handling
    // 1. Validate state token
    // 2. Exchange authorization code for tokens
    // 3. Get user info from provider
    // 4. Create or update user in database
    // 5. Create session
    // 6. Generate JWT access token

    // Validate state
    this.validateState(input.state);

    // Exchange code for tokens from OAuth provider
    const providerTokens = await this.exchangeCodeForTokens(input.provider, input.code);

    // Get user info from provider
    const providerUserInfo = await this.getUserInfoFromProvider(
      input.provider,
      providerTokens.accessToken,
    );

    // Find or create user
    const email = Email.create(providerUserInfo.email);
    let user = await this.userRepository.findByEmail(email);
    let isNewUser = false;

    if (!user) {
      // Create new user
      // TODO: OAuth users don't have passwords, need to handle this in User entity
      user = User.create({
        email: providerUserInfo.email,
        passwordHash: '', // TODO: OAuth users don't have passwords
      });
      await this.userRepository.save(user);
      isNewUser = true;
    }

    // Create session
    const session = Session.create({
      userId: user.id.toString(),
      expiresInDays: 30,
    });
    await this.sessionRepository.save(session);

    // Generate JWT access token
    const accessToken = this.generateAccessToken(user);

    return {
      tokens: {
        accessToken,
        refreshToken: session.refreshToken.toString(),
        expiresIn: 3600, // 1 hour in seconds
        tokenType: 'Bearer',
      },
      user: userToDTO(user),
      isNewUser,
    };
  }

  private validateState(state: string): void {
    // TODO: Validate state token against stored value
    if (!state) {
      throw new Error('Invalid state token');
    }
  }

  private async exchangeCodeForTokens(
    provider: string,
    code: string,
  ): Promise<{ accessToken: string; refreshToken?: string }> {
    // TODO: Exchange authorization code for tokens with OAuth provider
    // For Google: POST to https://oauth2.googleapis.com/token
    // For GitHub: POST to https://github.com/login/oauth/access_token

    return {
      accessToken: `provider_token_${code}`,
      refreshToken: undefined,
    };
  }

  private async getUserInfoFromProvider(
    provider: string,
    accessToken: string,
  ): Promise<{ email: string; name?: string; picture?: string }> {
    // TODO: Get user info from OAuth provider
    // For Google: GET https://www.googleapis.com/oauth2/v2/userinfo
    // For GitHub: GET https://api.github.com/user

    return {
      email: 'user@example.com',
      name: 'John Doe',
      picture: undefined,
    };
  }

  private generateAccessToken(user: User): string {
    // TODO: Generate JWT access token with user claims
    // Should include: user_id, email, team_ids, exp

    return `jwt_token_${user.id.toString()}`;
  }
}
