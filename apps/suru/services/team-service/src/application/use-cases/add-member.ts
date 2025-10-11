/**
 * Add Member Use Case
 */

import type { TeamRepository } from '../../domain/repositories/team-repository.js';
import { TeamId } from '../../domain/value-objects/index.js';
import { type TeamDTO, teamToDTO } from '../mappers/team-mapper.js';

export interface AddMemberInput {
  teamId: string;
  userId: string;
  role: string;
  addedBy: string;
}

export interface AddMemberOutput {
  team: TeamDTO;
}

export class AddMemberUseCase {
  constructor(private teamRepository: TeamRepository) {}

  async execute(input: AddMemberInput): Promise<AddMemberOutput> {
    const teamId = TeamId.create(input.teamId);
    const team = await this.teamRepository.findById(teamId, true);

    if (!team) {
      throw new Error(`Team with id ${input.teamId} not found`);
    }

    // Add member using team aggregate method
    team.addMember({
      userId: input.userId,
      role: input.role,
      addedBy: input.addedBy,
    });

    await this.teamRepository.save(team);

    return {
      team: teamToDTO(team),
    };
  }
}
