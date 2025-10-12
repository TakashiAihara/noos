/**
 * Get Current User Use Case
 */

import type { UserRepository } from '../../domain/repositories/user-repository';
import { UserId } from '../../domain/value-objects/user-id';
import { type UserClaimsDTO, type UserDTO, userToDTO } from '../mappers/user-mapper';

export interface GetCurrentUserInput {
  accessToken: string;
}

export interface GetCurrentUserOutput {
  user: UserDTO;
  claims: UserClaimsDTO;
}

export class GetCurrentUserUseCase {
  constructor(private userRepository: UserRepository) {}

  async execute(input: GetCurrentUserInput): Promise<GetCurrentUserOutput> {
    // Decode and validate token
    const claims = this.decodeToken(input.accessToken);

    // Get user from database
    const userId = UserId.create(claims.userId);
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new Error(`User with id ${claims.userId} not found`);
    }

    return {
      user: userToDTO(user),
      claims,
    };
  }

  private decodeToken(token: string): UserClaimsDTO {
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
