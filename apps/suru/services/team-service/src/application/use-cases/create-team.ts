/**
 * Create Team Use Case
 */

import { Team } from '../../domain/entities/team.js';
import type { TeamRepository } from '../../domain/repositories/team-repository.js';

export interface CreateTeamInput {
  name: string;
  description?: string;
  createdBy: string;
}

export interface CreateTeamOutput {
  teamId: string;
}

export class CreateTeamUseCase {
  constructor(private teamRepository: TeamRepository) {}

  async execute(input: CreateTeamInput): Promise<CreateTeamOutput> {
    const team = Team.create({
      name: input.name,
      description: input.description,
      createdBy: input.createdBy,
    });

    await this.teamRepository.save(team);

    return { teamId: team.id.toString() };
  }
}
