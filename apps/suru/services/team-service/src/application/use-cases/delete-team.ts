/**
 * Delete Team Use Case
 */

import type { TeamRepository } from '../../domain/repositories/team-repository.js';
import { TeamId } from '../../domain/value-objects/index.js';

export interface DeleteTeamInput {
  teamId: string;
}

export interface DeleteTeamOutput {
  success: boolean;
}

export class DeleteTeamUseCase {
  constructor(private teamRepository: TeamRepository) {}

  async execute(input: DeleteTeamInput): Promise<DeleteTeamOutput> {
    const teamId = TeamId.create(input.teamId);
    const team = await this.teamRepository.findById(teamId, false);

    if (!team) {
      throw new Error(`Team with id ${input.teamId} not found`);
    }

    await this.teamRepository.delete(teamId);

    return { success: true };
  }
}
