/**
 * Team Service gRPC Server Implementation
 */

import { create } from '@bufbuild/protobuf';
import type { ConnectRouter } from '@connectrpc/connect';
import { Code, ConnectError } from '@connectrpc/connect';
import { TeamService } from '@noos/suru-proto/dist/team-service_connect';
import {
  type AddMemberRequest,
  type AddMemberResponse,
  AddMemberResponseSchema,
  type ArchiveProjectRequest,
  type ArchiveProjectResponse,
  ArchiveProjectResponseSchema,
  type CreateProjectRequest,
  type CreateProjectResponse,
  CreateProjectResponseSchema,
  type CreateTeamRequest,
  type CreateTeamResponse,
  CreateTeamResponseSchema,
  type DeleteProjectRequest,
  type DeleteProjectResponse,
  DeleteProjectResponseSchema,
  type DeleteTeamRequest,
  type DeleteTeamResponse,
  DeleteTeamResponseSchema,
  type GetProjectRequest,
  type GetProjectResponse,
  GetProjectResponseSchema,
  type GetTeamRequest,
  type GetTeamResponse,
  GetTeamResponseSchema,
  type ListMembersRequest,
  type ListMembersResponse,
  ListMembersResponseSchema,
  type ListProjectsRequest,
  type ListProjectsResponse,
  ListProjectsResponseSchema,
  type ListUserTeamsRequest,
  type ListUserTeamsResponse,
  ListUserTeamsResponseSchema,
  ProjectSchema,
  type RemoveMemberRequest,
  type RemoveMemberResponse,
  RemoveMemberResponseSchema,
  TeamMemberSchema,
  TeamRole,
  TeamSchema,
  type UpdateMemberRoleRequest,
  type UpdateMemberRoleResponse,
  UpdateMemberRoleResponseSchema,
  type UpdateProjectRequest,
  type UpdateProjectResponse,
  UpdateProjectResponseSchema,
  type UpdateTeamRequest,
  type UpdateTeamResponse,
  UpdateTeamResponseSchema,
} from '@noos/suru-proto/dist/team-service_pb';

import { AddMemberUseCase } from '../../application/use-cases/add-member';
import { ArchiveProjectUseCase } from '../../application/use-cases/archive-project';
import { CreateProjectUseCase } from '../../application/use-cases/create-project';
import { CreateTeamUseCase } from '../../application/use-cases/create-team';
import { DeleteProjectUseCase } from '../../application/use-cases/delete-project';
import { DeleteTeamUseCase } from '../../application/use-cases/delete-team';
import { GetProjectUseCase } from '../../application/use-cases/get-project';
import { GetTeamUseCase } from '../../application/use-cases/get-team';
import { ListMembersUseCase } from '../../application/use-cases/list-members';
import { ListProjectsUseCase } from '../../application/use-cases/list-projects';
import { ListUserTeamsUseCase } from '../../application/use-cases/list-user-teams';
import { RemoveMemberUseCase } from '../../application/use-cases/remove-member';
import { UpdateMemberRoleUseCase } from '../../application/use-cases/update-member-role';
import { UpdateProjectUseCase } from '../../application/use-cases/update-project';
import { UpdateTeamUseCase } from '../../application/use-cases/update-team';
import type { ProjectRepository } from '../../domain/repositories/project-repository';
import type { TeamRepository } from '../../domain/repositories/team-repository';

export class TeamServiceHandler {
  private createTeamUseCase: CreateTeamUseCase;
  private getTeamUseCase: GetTeamUseCase;
  private listUserTeamsUseCase: ListUserTeamsUseCase;
  private updateTeamUseCase: UpdateTeamUseCase;
  private deleteTeamUseCase: DeleteTeamUseCase;
  private addMemberUseCase: AddMemberUseCase;
  private removeMemberUseCase: RemoveMemberUseCase;
  private updateMemberRoleUseCase: UpdateMemberRoleUseCase;
  private listMembersUseCase: ListMembersUseCase;
  private createProjectUseCase: CreateProjectUseCase;
  private getProjectUseCase: GetProjectUseCase;
  private listProjectsUseCase: ListProjectsUseCase;
  private updateProjectUseCase: UpdateProjectUseCase;
  private archiveProjectUseCase: ArchiveProjectUseCase;
  private deleteProjectUseCase: DeleteProjectUseCase;

  constructor(teamRepository: TeamRepository, projectRepository: ProjectRepository) {
    this.createTeamUseCase = new CreateTeamUseCase(teamRepository);
    this.getTeamUseCase = new GetTeamUseCase(teamRepository);
    this.listUserTeamsUseCase = new ListUserTeamsUseCase(teamRepository);
    this.updateTeamUseCase = new UpdateTeamUseCase(teamRepository);
    this.deleteTeamUseCase = new DeleteTeamUseCase(teamRepository);
    this.addMemberUseCase = new AddMemberUseCase(teamRepository);
    this.removeMemberUseCase = new RemoveMemberUseCase(teamRepository);
    this.updateMemberRoleUseCase = new UpdateMemberRoleUseCase(teamRepository);
    this.listMembersUseCase = new ListMembersUseCase(teamRepository);
    this.createProjectUseCase = new CreateProjectUseCase(projectRepository, teamRepository);
    this.getProjectUseCase = new GetProjectUseCase(projectRepository);
    this.listProjectsUseCase = new ListProjectsUseCase(projectRepository);
    this.updateProjectUseCase = new UpdateProjectUseCase(projectRepository);
    this.archiveProjectUseCase = new ArchiveProjectUseCase(projectRepository);
    this.deleteProjectUseCase = new DeleteProjectUseCase(projectRepository);
  }

  registerRoutes(router: ConnectRouter): void {
    router.service(TeamService, {
      createTeam: async (req: CreateTeamRequest): Promise<CreateTeamResponse> => {
        try {
          // Extract createdBy from request metadata (would come from auth context)
          const createdBy = 'system'; // TODO: Get from auth context

          const result = await this.createTeamUseCase.execute({
            name: req.name,
            createdBy,
          });

          // Get the created team to return full details
          const team = await this.getTeamUseCase.execute({
            teamId: result.teamId,
          });

          // TODO: Fetch user details from Auth Service for all members
          return create(CreateTeamResponseSchema, {
            team: create(TeamSchema, {
              id: team.team.id,
              name: team.team.name,
              members: team.team.members.map((member) =>
                create(TeamMemberSchema, {
                  userId: member.userId,
                  email: `${member.userId}@example.com`,
                  displayName: `User ${member.userId}`,
                  avatarUrl: undefined,
                  role: this.mapRoleToProto(member.role),
                  joinedAt: member.joinedAt.toISOString(),
                }),
              ),
              createdBy: team.team.createdBy,
              createdAt: team.team.createdAt.toISOString(),
              updatedAt: team.team.updatedAt.toISOString(),
            }),
          });
        } catch (error) {
          throw new ConnectError(
            error instanceof Error ? error.message : 'Failed to create team',
            Code.Internal,
          );
        }
      },

      getTeam: async (req: GetTeamRequest): Promise<GetTeamResponse> => {
        try {
          const result = await this.getTeamUseCase.execute({
            teamId: req.id,
          });

          // TODO: Fetch user details from Auth Service for all members
          return create(GetTeamResponseSchema, {
            team: create(TeamSchema, {
              id: result.team.id,
              name: result.team.name,
              members: result.team.members.map((member) =>
                create(TeamMemberSchema, {
                  userId: member.userId,
                  email: `${member.userId}@example.com`,
                  displayName: `User ${member.userId}`,
                  avatarUrl: undefined,
                  role: this.mapRoleToProto(member.role),
                  joinedAt: member.joinedAt.toISOString(),
                }),
              ),
              createdBy: result.team.createdBy,
              createdAt: result.team.createdAt.toISOString(),
              updatedAt: result.team.updatedAt.toISOString(),
            }),
          });
        } catch (error) {
          if (error instanceof Error && error.message.includes('not found')) {
            throw new ConnectError(error.message, Code.NotFound);
          }
          throw new ConnectError(
            error instanceof Error ? error.message : 'Failed to get team',
            Code.Internal,
          );
        }
      },

      listUserTeams: async (req: ListUserTeamsRequest): Promise<ListUserTeamsResponse> => {
        try {
          const result = await this.listUserTeamsUseCase.execute({
            userId: req.userId,
          });

          // TODO: Fetch user details from Auth Service for all members
          return create(ListUserTeamsResponseSchema, {
            teams: result.teams.map((team) =>
              create(TeamSchema, {
                id: team.id,
                name: team.name,
                members: team.members.map((member) =>
                  create(TeamMemberSchema, {
                    userId: member.userId,
                    email: `${member.userId}@example.com`,
                    displayName: `User ${member.userId}`,
                    avatarUrl: undefined,
                    role: this.mapRoleToProto(member.role),
                    joinedAt: member.joinedAt.toISOString(),
                  }),
                ),
                createdBy: team.createdBy,
                createdAt: team.createdAt.toISOString(),
                updatedAt: team.updatedAt.toISOString(),
              }),
            ),
          });
        } catch (error) {
          throw new ConnectError(
            error instanceof Error ? error.message : 'Failed to list user teams',
            Code.Internal,
          );
        }
      },

      updateTeam: async (req: UpdateTeamRequest): Promise<UpdateTeamResponse> => {
        try {
          const result = await this.updateTeamUseCase.execute({
            teamId: req.id,
            name: req.name,
          });

          // TODO: Fetch user details from Auth Service for all members
          return create(UpdateTeamResponseSchema, {
            team: create(TeamSchema, {
              id: result.team.id,
              name: result.team.name,
              members: result.team.members.map((member) =>
                create(TeamMemberSchema, {
                  userId: member.userId,
                  email: `${member.userId}@example.com`,
                  displayName: `User ${member.userId}`,
                  avatarUrl: undefined,
                  role: this.mapRoleToProto(member.role),
                  joinedAt: member.joinedAt.toISOString(),
                }),
              ),
              createdBy: result.team.createdBy,
              createdAt: result.team.createdAt.toISOString(),
              updatedAt: result.team.updatedAt.toISOString(),
            }),
          });
        } catch (error) {
          if (error instanceof Error && error.message.includes('not found')) {
            throw new ConnectError(error.message, Code.NotFound);
          }
          throw new ConnectError(
            error instanceof Error ? error.message : 'Failed to update team',
            Code.Internal,
          );
        }
      },

      deleteTeam: async (req: DeleteTeamRequest): Promise<DeleteTeamResponse> => {
        try {
          const result = await this.deleteTeamUseCase.execute({
            teamId: req.id,
          });

          return create(DeleteTeamResponseSchema, {
            success: result.success,
          });
        } catch (error) {
          if (error instanceof Error && error.message.includes('not found')) {
            throw new ConnectError(error.message, Code.NotFound);
          }
          throw new ConnectError(
            error instanceof Error ? error.message : 'Failed to delete team',
            Code.Internal,
          );
        }
      },

      addMember: async (req: AddMemberRequest): Promise<AddMemberResponse> => {
        try {
          // Execute add member use case
          const addedBy = 'system'; // TODO: Get from auth context
          const result = await this.addMemberUseCase.execute({
            teamId: req.teamId,
            userId: req.userId,
            role: this.mapRoleFromProto(req.role),
            addedBy,
          });

          // Find the added member from the team
          const addedMember = result.team.members.find((m) => m.userId === req.userId);

          if (!addedMember) {
            throw new Error('Failed to add member');
          }

          // TODO: Fetch user details from Auth Service
          // For now, use placeholder values
          const email = `${req.userId}@example.com`;
          const displayName = `User ${req.userId}`;

          return create(AddMemberResponseSchema, {
            member: create(TeamMemberSchema, {
              userId: addedMember.userId,
              email,
              displayName,
              avatarUrl: undefined,
              role: this.mapRoleToProto(addedMember.role),
              joinedAt: addedMember.joinedAt.toISOString(),
            }),
          });
        } catch (error) {
          if (error instanceof Error && error.message.includes('not found')) {
            throw new ConnectError(error.message, Code.NotFound);
          }
          throw new ConnectError(
            error instanceof Error ? error.message : 'Failed to add member',
            Code.Internal,
          );
        }
      },

      removeMember: async (req: RemoveMemberRequest): Promise<RemoveMemberResponse> => {
        try {
          const result = await this.removeMemberUseCase.execute({
            teamId: req.teamId,
            userId: req.userId,
          });

          return create(RemoveMemberResponseSchema, {
            success: result.success,
          });
        } catch (error) {
          if (error instanceof Error && error.message.includes('not found')) {
            throw new ConnectError(error.message, Code.NotFound);
          }
          throw new ConnectError(
            error instanceof Error ? error.message : 'Failed to remove member',
            Code.Internal,
          );
        }
      },

      updateMemberRole: async (req: UpdateMemberRoleRequest): Promise<UpdateMemberRoleResponse> => {
        try {
          const result = await this.updateMemberRoleUseCase.execute({
            teamId: req.teamId,
            userId: req.userId,
            role: this.mapRoleFromProto(req.role),
          });

          // Find the updated member from the team
          const updatedMember = result.team.members.find((m) => m.userId === req.userId);

          if (!updatedMember) {
            throw new Error('Failed to update member role');
          }

          // TODO: Fetch user details from Auth Service
          // For now, use placeholder values
          const email = `${req.userId}@example.com`;
          const displayName = `User ${req.userId}`;

          return create(UpdateMemberRoleResponseSchema, {
            member: create(TeamMemberSchema, {
              userId: updatedMember.userId,
              email,
              displayName,
              avatarUrl: undefined,
              role: this.mapRoleToProto(updatedMember.role),
              joinedAt: updatedMember.joinedAt.toISOString(),
            }),
          });
        } catch (error) {
          if (error instanceof Error && error.message.includes('not found')) {
            throw new ConnectError(error.message, Code.NotFound);
          }
          throw new ConnectError(
            error instanceof Error ? error.message : 'Failed to update member role',
            Code.Internal,
          );
        }
      },

      listMembers: async (req: ListMembersRequest): Promise<ListMembersResponse> => {
        try {
          const result = await this.listMembersUseCase.execute({
            teamId: req.teamId,
          });

          // TODO: Fetch user details from Auth Service for all members
          // For now, use placeholder values
          return create(ListMembersResponseSchema, {
            members: result.members.map((member) =>
              create(TeamMemberSchema, {
                userId: member.userId,
                email: `${member.userId}@example.com`,
                displayName: `User ${member.userId}`,
                avatarUrl: undefined,
                role: this.mapRoleToProto(member.role),
                joinedAt: member.joinedAt.toISOString(),
              }),
            ),
          });
        } catch (error) {
          if (error instanceof Error && error.message.includes('not found')) {
            throw new ConnectError(error.message, Code.NotFound);
          }
          throw new ConnectError(
            error instanceof Error ? error.message : 'Failed to list members',
            Code.Internal,
          );
        }
      },

      createProject: async (req: CreateProjectRequest): Promise<CreateProjectResponse> => {
        try {
          // Extract createdBy from request metadata (would come from auth context)
          const createdBy = 'system'; // TODO: Get from auth context

          const result = await this.createProjectUseCase.execute({
            teamId: req.teamId,
            name: req.name,
            description: req.description,
            createdBy,
          });

          // Get the created project to return full details
          const project = await this.getProjectUseCase.execute({
            projectId: result.projectId,
          });

          return create(CreateProjectResponseSchema, {
            project: create(ProjectSchema, {
              id: project.project.id,
              teamId: project.project.teamId,
              name: project.project.name,
              description: project.project.description,
              archived: project.project.archived,
              createdBy: project.project.createdBy,
              createdAt: project.project.createdAt.toISOString(),
              updatedAt: project.project.updatedAt.toISOString(),
            }),
          });
        } catch (error) {
          if (error instanceof Error && error.message.includes('not found')) {
            throw new ConnectError(error.message, Code.NotFound);
          }
          throw new ConnectError(
            error instanceof Error ? error.message : 'Failed to create project',
            Code.Internal,
          );
        }
      },

      getProject: async (req: GetProjectRequest): Promise<GetProjectResponse> => {
        try {
          const result = await this.getProjectUseCase.execute({
            projectId: req.id,
          });

          return create(GetProjectResponseSchema, {
            project: create(ProjectSchema, {
              id: result.project.id,
              teamId: result.project.teamId,
              name: result.project.name,
              description: result.project.description,
              archived: result.project.archived,
              createdBy: result.project.createdBy,
              createdAt: result.project.createdAt.toISOString(),
              updatedAt: result.project.updatedAt.toISOString(),
            }),
          });
        } catch (error) {
          if (error instanceof Error && error.message.includes('not found')) {
            throw new ConnectError(error.message, Code.NotFound);
          }
          throw new ConnectError(
            error instanceof Error ? error.message : 'Failed to get project',
            Code.Internal,
          );
        }
      },

      listProjects: async (req: ListProjectsRequest): Promise<ListProjectsResponse> => {
        try {
          const result = await this.listProjectsUseCase.execute({
            teamId: req.teamId,
            includeArchived: req.includeArchived,
          });

          return create(ListProjectsResponseSchema, {
            projects: result.projects.map((project) =>
              create(ProjectSchema, {
                id: project.id,
                teamId: project.teamId,
                name: project.name,
                description: project.description,
                archived: project.archived,
                createdBy: project.createdBy,
                createdAt: project.createdAt.toISOString(),
                updatedAt: project.updatedAt.toISOString(),
              }),
            ),
          });
        } catch (error) {
          throw new ConnectError(
            error instanceof Error ? error.message : 'Failed to list projects',
            Code.Internal,
          );
        }
      },

      updateProject: async (req: UpdateProjectRequest): Promise<UpdateProjectResponse> => {
        try {
          const result = await this.updateProjectUseCase.execute({
            projectId: req.id,
            name: req.name,
            description: req.description,
          });

          return create(UpdateProjectResponseSchema, {
            project: create(ProjectSchema, {
              id: result.project.id,
              teamId: result.project.teamId,
              name: result.project.name,
              description: result.project.description,
              archived: result.project.archived,
              createdBy: result.project.createdBy,
              createdAt: result.project.createdAt.toISOString(),
              updatedAt: result.project.updatedAt.toISOString(),
            }),
          });
        } catch (error) {
          if (error instanceof Error && error.message.includes('not found')) {
            throw new ConnectError(error.message, Code.NotFound);
          }
          throw new ConnectError(
            error instanceof Error ? error.message : 'Failed to update project',
            Code.Internal,
          );
        }
      },

      archiveProject: async (req: ArchiveProjectRequest): Promise<ArchiveProjectResponse> => {
        try {
          const result = await this.archiveProjectUseCase.execute({
            projectId: req.id,
          });

          return create(ArchiveProjectResponseSchema, {
            project: create(ProjectSchema, {
              id: result.project.id,
              teamId: result.project.teamId,
              name: result.project.name,
              description: result.project.description,
              archived: result.project.archived,
              createdBy: result.project.createdBy,
              createdAt: result.project.createdAt.toISOString(),
              updatedAt: result.project.updatedAt.toISOString(),
            }),
          });
        } catch (error) {
          if (error instanceof Error && error.message.includes('not found')) {
            throw new ConnectError(error.message, Code.NotFound);
          }
          throw new ConnectError(
            error instanceof Error ? error.message : 'Failed to archive project',
            Code.Internal,
          );
        }
      },

      deleteProject: async (req: DeleteProjectRequest): Promise<DeleteProjectResponse> => {
        try {
          const result = await this.deleteProjectUseCase.execute({
            projectId: req.id,
          });

          return create(DeleteProjectResponseSchema, {
            success: result.success,
          });
        } catch (error) {
          if (error instanceof Error && error.message.includes('not found')) {
            throw new ConnectError(error.message, Code.NotFound);
          }
          throw new ConnectError(
            error instanceof Error ? error.message : 'Failed to delete project',
            Code.Internal,
          );
        }
      },
    });
  }

  private mapRoleToProto(role: string): TeamRole {
    switch (role) {
      case 'MEMBER':
        return TeamRole.MEMBER;
      case 'ADMIN':
        return TeamRole.ADMIN;
      case 'OWNER':
        return TeamRole.OWNER;
      default:
        return TeamRole.MEMBER;
    }
  }

  private mapRoleFromProto(role: TeamRole): string {
    switch (role) {
      case TeamRole.MEMBER:
        return 'MEMBER';
      case TeamRole.ADMIN:
        return 'ADMIN';
      case TeamRole.OWNER:
        return 'OWNER';
      default:
        return 'MEMBER';
    }
  }
}
