/**
 * Prisma Team Repository Implementation
 */

import { PrismaClient } from '@noos/suru-db';
import type { TeamRepository, TeamFilters } from '../../domain/repositories/team-repository';
import { Team } from '../../domain/entities/team';
import { TeamId } from '../../domain/value-objects/team-id';
import { ValidationError } from '@noos/suru-types';

export class PrismaTeamRepository implements TeamRepository {
  constructor(private prisma: PrismaClient) {}

  async save(team: Team): Promise<void> {
    const exists = await this.exists(team.id);

    const teamData = {
      id: team.id.toString(),
      name: team.name.toString(),
      description: team.description,
      createdBy: team.createdBy,
      version: team.version,
    };

    if (exists) {
      // Update with optimistic locking
      try {
        await this.prisma.$transaction(async (tx) => {
          // Update team
          await tx.team.update({
            where: {
              id: teamData.id,
              version: team.version - 1,
            },
            data: {
              ...teamData,
              updatedAt: new Date(),
            },
          });

          // Delete existing members and recreate
          await tx.teamMember.deleteMany({
            where: { teamId: teamData.id },
          });

          // Insert current members
          const members = team.getMembers();
          if (members.length > 0) {
            await tx.teamMember.createMany({
              data: members.map((member) => ({
                id: member.id,
                teamId: teamData.id,
                userId: member.userId,
                role: member.role,
                joinedAt: member.joinedAt,
              })),
            });
          }
        });
      } catch (error) {
        throw new ValidationError('Team version conflict - team was modified by another process');
      }
    } else {
      // Create new team with members
      await this.prisma.$transaction(async (tx) => {
        await tx.team.create({
          data: {
            ...teamData,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        });

        const members = team.getMembers();
        if (members.length > 0) {
          await tx.teamMember.createMany({
            data: members.map((member) => ({
              id: member.id,
              teamId: teamData.id,
              userId: member.userId,
              role: member.role,
              joinedAt: member.joinedAt,
            })),
          });
        }
      });
    }
  }

  async findById(id: TeamId, includeMembers = false): Promise<Team | null> {
    const teamData = await this.prisma.team.findUnique({
      where: { id: id.toString() },
      include: {
        members: includeMembers,
      },
    });

    if (!teamData) {
      return null;
    }

    // Create team without members first
    const team = Team.create({
      name: teamData.name,
      description: teamData.description ?? undefined,
      createdBy: teamData.createdBy,
    });

    // Override internal state to match persisted data
    // This is a workaround since Team doesn't have a reconstitute method
    // In production, Team entity should have a static reconstitute method
    const teamWithState = Object.assign(team, {
      props: {
        id: TeamId.create(teamData.id),
        name: team.name,
        description: teamData.description ?? undefined,
        createdBy: teamData.createdBy,
        createdAt: teamData.createdAt,
        updatedAt: teamData.updatedAt,
        version: teamData.version,
      },
    });

    // Add members if included
    if (includeMembers && teamData.members) {
      const membersArray: any[] = [];
      for (const memberData of teamData.members) {
        // Reconstruct team member
        membersArray.push({
          id: memberData.id,
          userId: memberData.userId,
          teamId: memberData.teamId,
          role: memberData.role,
          joinedAt: memberData.joinedAt,
        });
      }
      Object.assign(teamWithState, { members: membersArray });
    }

    return teamWithState;
  }

  async findMany(filters: TeamFilters): Promise<{
    teams: Team[];
    totalCount: number;
  }> {
    const where: any = {};

    if (filters.createdBy) {
      where.createdBy = filters.createdBy;
    }

    if (filters.memberUserId) {
      where.members = {
        some: {
          userId: filters.memberUserId,
        },
      };
    }

    const [teams, totalCount] = await Promise.all([
      this.prisma.team.findMany({
        where,
        skip: filters.offset,
        take: filters.limit,
        include: {
          members: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.team.count({ where }),
    ]);

    return {
      teams: teams.map((teamData) => {
        const team = Team.create({
          name: teamData.name,
          description: teamData.description ?? undefined,
          createdBy: teamData.createdBy,
        });

        const teamWithState = Object.assign(team, {
          props: {
            id: TeamId.create(teamData.id),
            name: team.name,
            description: teamData.description ?? undefined,
            createdBy: teamData.createdBy,
            createdAt: teamData.createdAt,
            updatedAt: teamData.updatedAt,
            version: teamData.version,
          },
        });

        const membersArray: any[] = teamData.members.map((m) => ({
          id: m.id,
          userId: m.userId,
          teamId: m.teamId,
          role: m.role,
          joinedAt: m.joinedAt,
        }));
        Object.assign(teamWithState, { members: membersArray });

        return teamWithState;
      }),
      totalCount,
    };
  }

  async delete(id: TeamId): Promise<void> {
    await this.prisma.team.delete({
      where: { id: id.toString() },
    });
  }

  async exists(id: TeamId): Promise<boolean> {
    const count = await this.prisma.team.count({
      where: { id: id.toString() },
    });
    return count > 0;
  }
}
