/**
 * Remove Member Use Case
 */

import type { TeamRepository } from '../../domain/repositories/team-repository.js';
import { TeamId } from '../../domain/value-objects/index.js';
import { type TeamDTO, teamToDTO } from '../mappers/team-mapper.js';

export interface RemoveMemberInput {
  teamId: string;
  userId: string;
  removedBy: string;
}

export interface RemoveMemberOutput {
  team: TeamDTO;
}

export class RemoveMemberUseCase {
  constructor(private teamRepository: TeamRepository) {}

  async execute(input: RemoveMemberInput): Promise<RemoveMemberOutput> {
    const teamId = TeamId.create(input.teamId);
    const team = await this.teamRepository.findById(teamId, true);

    if (!team) {
      throw new Error(`Team with id ${input.teamId} not found`);
    }

    // Remove member using team aggregate method
    team.removeMember({
      userId: input.userId,
      removedBy: input.removedBy,
    });

    await this.teamRepository.save(team);

    return {
      team: teamToDTO(team),
    };
  }
}
