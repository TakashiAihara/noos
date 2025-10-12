/**
 * Team Mapper - Converts Team entity to DTO
 */

import type { Team } from '../../domain/entities/team';
import type { TeamMember } from '../../domain/entities/team-member';

export interface TeamMemberDTO {
  userId: string;
  teamId: string;
  role: string;
  joinedAt: Date;
}

export interface TeamDTO {
  id: string;
  name: string;
  description?: string;
  members: TeamMemberDTO[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  version: number;
}

export function teamToDTO(team: Team): TeamDTO {
  return {
    id: team.id.toString(),
    name: team.name.toString(),
    description: team.description,
    members: team.getMembers().map((m) => teamMemberToDTO(m)),
    createdBy: team.createdBy,
    createdAt: team.createdAt,
    updatedAt: team.updatedAt,
    version: team.version,
  };
}

export function teamMemberToDTO(member: TeamMember): TeamMemberDTO {
  return {
    userId: member.userId,
    teamId: member.teamId,
    role: member.role.toString(),
    joinedAt: member.joinedAt,
  };
}
