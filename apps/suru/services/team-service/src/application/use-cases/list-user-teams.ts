/**
 * List User Teams Use Case
 */

import type { TeamRepository } from '../../domain/repositories/team-repository.js';
import { type TeamDTO, teamToDTO } from '../mappers/team-mapper.js';

export interface ListUserTeamsInput {
  userId: string;
  page?: number;
  pageSize?: number;
}

export interface ListUserTeamsOutput {
  teams: TeamDTO[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export class ListUserTeamsUseCase {
  constructor(private teamRepository: TeamRepository) {}

  async execute(input: ListUserTeamsInput): Promise<ListUserTeamsOutput> {
    const page = input.page ?? 1;
    const pageSize = input.pageSize ?? 20;
    const offset = (page - 1) * pageSize;

    // Use findMany with memberUserId filter
    const result = await this.teamRepository.findMany({
      memberUserId: input.userId,
      limit: pageSize,
      offset,
    });

    return {
      teams: result.teams.map((team) => teamToDTO(team)),
      totalCount: result.totalCount,
      page,
      pageSize,
    };
  }
}
