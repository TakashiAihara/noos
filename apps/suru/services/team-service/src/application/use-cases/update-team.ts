/**
 * Update Team Use Case
 */

import type { TeamRepository } from '../../domain/repositories/team-repository.js';
import { TeamId } from '../../domain/value-objects/index.js';
import { type TeamDTO, teamToDTO } from '../mappers/team-mapper.js';

export interface UpdateTeamInput {
  teamId: string;
  name?: string;
  description?: string;
  version: number;
}

export interface UpdateTeamOutput {
  team: TeamDTO;
}

export class UpdateTeamUseCase {
  constructor(private teamRepository: TeamRepository) {}

  async execute(input: UpdateTeamInput): Promise<UpdateTeamOutput> {
    const teamId = TeamId.create(input.teamId);
    const team = await this.teamRepository.findById(teamId, true);

    if (!team) {
      throw new Error(`Team with id ${input.teamId} not found`);
    }

    // Check version for optimistic locking
    if (team.version !== input.version) {
      throw new Error('Team version conflict - team was modified by another process');
    }

    // Update team details
    team.updateDetails({
      name: input.name,
      description: input.description,
    });

    await this.teamRepository.save(team);

    return {
      team: teamToDTO(team),
    };
  }
}
