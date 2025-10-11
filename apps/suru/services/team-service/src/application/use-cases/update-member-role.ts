/**
 * Update Member Role Use Case
 */

import type { TeamRepository } from '../../domain/repositories/team-repository.js';
import { TeamId } from '../../domain/value-objects/index.js';
import { type TeamDTO, teamToDTO } from '../mappers/team-mapper.js';

export interface UpdateMemberRoleInput {
  teamId: string;
  userId: string;
  newRole: string;
  changedBy: string;
}

export interface UpdateMemberRoleOutput {
  team: TeamDTO;
}

export class UpdateMemberRoleUseCase {
  constructor(private teamRepository: TeamRepository) {}

  async execute(input: UpdateMemberRoleInput): Promise<UpdateMemberRoleOutput> {
    const teamId = TeamId.create(input.teamId);
    const team = await this.teamRepository.findById(teamId, true);

    if (!team) {
      throw new Error(`Team with id ${input.teamId} not found`);
    }

    // Change member role using team aggregate method
    team.changeMemberRole({
      userId: input.userId,
      newRole: input.newRole,
      changedBy: input.changedBy,
    });

    await this.teamRepository.save(team);

    return {
      team: teamToDTO(team),
    };
  }
}
