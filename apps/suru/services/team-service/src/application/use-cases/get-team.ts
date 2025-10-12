/**
 * Get Team Use Case
 */

import type { TeamRepository } from '../../domain/repositories/team-repository.js';
import { TeamId } from '../../domain/value-objects/index.js';
import { type TeamDTO, teamToDTO } from '../mappers/team-mapper.js';

export interface GetTeamInput {
  teamId: string;
  includeMembers?: boolean;
}

export interface GetTeamOutput {
  team: TeamDTO;
}

export class GetTeamUseCase {
  constructor(private teamRepository: TeamRepository) {}

  async execute(input: GetTeamInput): Promise<GetTeamOutput> {
    const teamId = TeamId.create(input.teamId);
    const team = await this.teamRepository.findById(teamId, input.includeMembers ?? true);

    if (!team) {
      throw new Error(`Team with id ${input.teamId} not found`);
    }

    return {
      team: teamToDTO(team),
    };
  }
}
