/**
 * Contract tests for Team Service gRPC interface
 */

import { describe, it, expect } from 'vitest';
import { createPromiseClient } from '@connectrpc/connect';
import { createGrpcTransport } from '@connectrpc/connect-node';
import { TeamService } from '@noos/suru-proto';
import type {
  CreateTeamRequest,
  GetTeamRequest,
  AddMemberRequest,
  CreateProjectRequest,
  ListProjectsRequest,
} from '@noos/suru-proto';

const TEST_PORT = 50052;
const transport = createGrpcTransport({
  baseUrl: `http://localhost:${TEST_PORT}`,
  httpVersion: '2',
});

const client = createPromiseClient(TeamService, transport);

describe('Team Service Contract', () => {
  describe('CreateTeam', () => {
    it('should create a team', async () => {
      const request: CreateTeamRequest = {
        name: 'Engineering Team',
      };

      const response = await client.createTeam(request);

      expect(response.team).toBeDefined();
      expect(response.team?.id).toBeDefined();
      expect(response.team?.name).toBe('Engineering Team');
      expect(response.team?.members).toHaveLength(1); // Creator is auto-added as OWNER
      expect(response.team?.members[0].role).toBe('OWNER');
    });
  });

  describe('AddMember', () => {
    it('should add member with specified role', async () => {
      const request: AddMemberRequest = {
        teamId: '123e4567-e89b-12d3-a456-426614174000',
        userId: '123e4567-e89b-12d3-a456-426614174001',
        role: 'ADMIN',
      };

      const response = await client.addMember(request);

      expect(response.member?.userId).toBe('123e4567-e89b-12d3-a456-426614174001');
      expect(response.member?.role).toBe('ADMIN');
    });

    it('should reject duplicate member', async () => {
      const request: AddMemberRequest = {
        teamId: '123e4567-e89b-12d3-a456-426614174000',
        userId: '123e4567-e89b-12d3-a456-426614174001',
        role: 'MEMBER',
      };

      await expect(client.addMember(request)).rejects.toThrow('ALREADY_EXISTS');
    });
  });

  describe('CreateProject', () => {
    it('should create a project within team', async () => {
      const request: CreateProjectRequest = {
        teamId: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Q4 Roadmap',
        description: 'Q4 2025 project goals',
      };

      const response = await client.createProject(request);

      expect(response.project).toBeDefined();
      expect(response.project?.teamId).toBe('123e4567-e89b-12d3-a456-426614174000');
      expect(response.project?.name).toBe('Q4 Roadmap');
      expect(response.project?.archived).toBe(false);
    });

    it('should enforce unique project name within team', async () => {
      const request: CreateProjectRequest = {
        teamId: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Duplicate Project',
      };

      await client.createProject(request); // First creation
      await expect(client.createProject(request)).rejects.toThrow('ALREADY_EXISTS');
    });
  });

  describe('ListProjects', () => {
    it('should list active projects by default', async () => {
      const request: ListProjectsRequest = {
        teamId: '123e4567-e89b-12d3-a456-426614174000',
        includeArchived: false,
      };

      const response = await client.listProjects(request);

      expect(response.projects).toBeDefined();
      for (const project of response.projects) {
        expect(project.archived).toBe(false);
      }
    });

    it('should include archived projects when requested', async () => {
      const request: ListProjectsRequest = {
        teamId: '123e4567-e89b-12d3-a456-426614174000',
        includeArchived: true,
      };

      const response = await client.listProjects(request);

      expect(response.projects).toBeDefined();
    });
  });
});
