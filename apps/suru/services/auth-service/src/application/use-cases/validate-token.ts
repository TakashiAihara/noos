/**
 * Validate Token Use Case
 */

import type { UserClaimsDTO } from '../mappers/user-mapper';

export interface ValidateTokenInput {
  accessToken: string;
}

export interface ValidateTokenOutput {
  valid: boolean;
  claims?: UserClaimsDTO;
}

export class ValidateTokenUseCase {
  async execute(input: ValidateTokenInput): Promise<ValidateTokenOutput> {
    try {
      // TODO: Implement JWT token validation
      // 1. Verify JWT signature
      // 2. Check expiration
      // 3. Extract claims

      const claims = this.decodeAndValidateToken(input.accessToken);

      return {
        valid: true,
        claims,
      };
    } catch (error) {
      return {
        valid: false,
        claims: undefined,
      };
    }
  }

  private decodeAndValidateToken(token: string): UserClaimsDTO {
    // TODO: Decode and validate JWT token
    // Should verify signature and check expiration

    // Mock implementation
    if (!token || token === '') {
      throw new Error('Invalid token');
    }

    return {
      userId: 'user_123',
      email: 'user@example.com',
      teamIds: [],
      exp: Date.now() / 1000 + 3600, // 1 hour from now
    };
  }
}
