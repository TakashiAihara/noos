/**
 * Get User Use Case
 */

import type { UserRepository } from '../../domain/repositories/user-repository';
import { UserId } from '../../domain/value-objects/user-id';
import { type UserDTO, userToDTO } from '../mappers/user-mapper';

export interface GetUserInput {
  userId: string;
}

export interface GetUserOutput {
  user: UserDTO;
}

export class GetUserUseCase {
  constructor(private userRepository: UserRepository) {}

  async execute(input: GetUserInput): Promise<GetUserOutput> {
    const userId = UserId.create(input.userId);
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new Error(`User with id ${input.userId} not found`);
    }

    return {
      user: userToDTO(user),
    };
  }
}
