/**
 * Update User Use Case
 */

import type { UserRepository } from '../../domain/repositories/user-repository';
import { UserId } from '../../domain/value-objects/user-id';
import { type UserDTO, userToDTO } from '../mappers/user-mapper';

export interface UpdateUserInput {
  userId: string;
  displayName?: string;
  avatarUrl?: string;
}

export interface UpdateUserOutput {
  user: UserDTO;
}

export class UpdateUserUseCase {
  constructor(private userRepository: UserRepository) {}

  async execute(input: UpdateUserInput): Promise<UpdateUserOutput> {
    const userId = UserId.create(input.userId);
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new Error(`User with id ${input.userId} not found`);
    }

    // TODO: User entity doesn't have displayName and avatarUrl yet
    // These fields need to be added to the User entity

    // For now, just save without updates
    await this.userRepository.save(user);

    return {
      user: userToDTO(user),
    };
  }
}
