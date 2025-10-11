/**
 * List Members Use Case
 */

import type { TeamRepository } from '../../domain/repositories/team-repository.js';
import { TeamId } from '../../domain/value-objects/index.js';
import { type TeamMemberDTO, teamMemberToDTO } from '../mappers/team-mapper.js';

export interface ListMembersInput {
  teamId: string;
}

export interface ListMembersOutput {
  members: TeamMemberDTO[];
  totalCount: number;
}

export class ListMembersUseCase {
  constructor(private teamRepository: TeamRepository) {}

  async execute(input: ListMembersInput): Promise<ListMembersOutput> {
    const teamId = TeamId.create(input.teamId);
    const team = await this.teamRepository.findById(teamId, true);

    if (!team) {
      throw new Error(`Team with id ${input.teamId} not found`);
    }

    const members = team.getMembers();

    return {
      members: members.map((member) => teamMemberToDTO(member)),
      totalCount: members.length,
    };
  }
}
