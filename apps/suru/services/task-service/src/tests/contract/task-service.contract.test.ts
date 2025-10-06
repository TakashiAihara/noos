/**
 * Contract tests for Task Service gRPC interface
 * These tests validate the service contract without implementation
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createPromiseClient } from '@connectrpc/connect';
import { createGrpcTransport } from '@connectrpc/connect-node';
import { TaskService } from '@noos/suru-proto';
import type {
  CreateTaskRequest,
  GetTaskRequest,
  ListTasksRequest,
  UpdateTaskRequest,
  DeleteTaskRequest,
  AssignTaskRequest,
  AddSubtaskRequest,
} from '@noos/suru-proto';

const TEST_PORT = 50051;
const transport = createGrpcTransport({
  baseUrl: `http://localhost:${TEST_PORT}`,
  httpVersion: '2',
});

const client = createPromiseClient(TaskService, transport);

describe('Task Service Contract', () => {
  describe('CreateTask', () => {
    it('should create a task with required fields', async () => {
      const request: CreateTaskRequest = {
        projectId: '123e4567-e89b-12d3-a456-426614174000',
        title: 'Test Task',
      };

      const response = await client.createTask(request);

      expect(response.task).toBeDefined();
      expect(response.task?.id).toBeDefined();
      expect(response.task?.title).toBe('Test Task');
      expect(response.task?.status).toBe('TODO');
    });

    it('should create a task with all optional fields', async () => {
      const request: CreateTaskRequest = {
        projectId: '123e4567-e89b-12d3-a456-426614174000',
        title: 'Full Task',
        description: 'Task with all fields',
        priority: 'HIGH',
        dueDate: '2025-12-31T23:59:59Z',
        tags: ['backend', 'urgent'],
        assigneeId: '123e4567-e89b-12d3-a456-426614174001',
      };

      const response = await client.createTask(request);

      expect(response.task?.description).toBe('Task with all fields');
      expect(response.task?.priority).toBe('HIGH');
      expect(response.task?.dueDate).toBe('2025-12-31T23:59:59Z');
      expect(response.task?.tags).toEqual(['backend', 'urgent']);
      expect(response.task?.assigneeId).toBe('123e4567-e89b-12d3-a456-426614174001');
    });

    it('should reject invalid project ID', async () => {
      const request: CreateTaskRequest = {
        projectId: 'invalid-uuid',
        title: 'Test Task',
      };

      await expect(client.createTask(request)).rejects.toThrow();
    });
  });

  describe('GetTask', () => {
    it('should retrieve a task by ID', async () => {
      const request: GetTaskRequest = {
        id: '123e4567-e89b-12d3-a456-426614174002',
        includeSubtasks: false,
      };

      const response = await client.getTask(request);

      expect(response.task).toBeDefined();
      expect(response.task?.id).toBe('123e4567-e89b-12d3-a456-426614174002');
    });

    it('should include subtasks when requested', async () => {
      const request: GetTaskRequest = {
        id: '123e4567-e89b-12d3-a456-426614174002',
        includeSubtasks: true,
      };

      const response = await client.getTask(request);

      expect(response.task?.subtasks).toBeDefined();
      expect(Array.isArray(response.task?.subtasks)).toBe(true);
    });

    it('should throw NOT_FOUND for non-existent task', async () => {
      const request: GetTaskRequest = {
        id: '00000000-0000-0000-0000-000000000000',
        includeSubtasks: false,
      };

      await expect(client.getTask(request)).rejects.toThrow('NOT_FOUND');
    });
  });

  describe('ListTasks', () => {
    it('should list tasks with pagination', async () => {
      const request: ListTasksRequest = {
        projectId: '123e4567-e89b-12d3-a456-426614174000',
        page: 1,
        pageSize: 10,
      };

      const response = await client.listTasks(request);

      expect(response.tasks).toBeDefined();
      expect(response.totalCount).toBeGreaterThanOrEqual(0);
      expect(response.page).toBe(1);
      expect(response.pageSize).toBe(10);
    });

    it('should filter tasks by status', async () => {
      const request: ListTasksRequest = {
        projectId: '123e4567-e89b-12d3-a456-426614174000',
        status: 'IN_PROGRESS',
        page: 1,
        pageSize: 10,
      };

      const response = await client.listTasks(request);

      response.tasks.forEach(task => {
        expect(task.status).toBe('IN_PROGRESS');
      });
    });

    it('should sort tasks by due date', async () => {
      const request: ListTasksRequest = {
        projectId: '123e4567-e89b-12d3-a456-426614174000',
        sortBy: 'due_date',
        sortOrder: 'asc',
        page: 1,
        pageSize: 10,
      };

      const response = await client.listTasks(request);

      expect(response.tasks).toBeDefined();
      // Verify ascending order
      for (let i = 1; i < response.tasks.length; i++) {
        if (response.tasks[i - 1].dueDate && response.tasks[i].dueDate) {
          expect(response.tasks[i - 1].dueDate <= response.tasks[i].dueDate).toBe(true);
        }
      }
    });
  });

  describe('UpdateTask', () => {
    it('should update task fields', async () => {
      const request: UpdateTaskRequest = {
        id: '123e4567-e89b-12d3-a456-426614174002',
        title: 'Updated Title',
        status: 'DONE',
        version: 0,
      };

      const response = await client.updateTask(request);

      expect(response.task?.title).toBe('Updated Title');
      expect(response.task?.status).toBe('DONE');
      expect(response.task?.version).toBe(1);
    });

    it('should enforce optimistic locking', async () => {
      const request: UpdateTaskRequest = {
        id: '123e4567-e89b-12d3-a456-426614174002',
        title: 'Conflict Update',
        version: 999, // Wrong version
      };

      await expect(client.updateTask(request)).rejects.toThrow('CONFLICT');
    });
  });

  describe('DeleteTask', () => {
    it('should delete a task', async () => {
      const request: DeleteTaskRequest = {
        id: '123e4567-e89b-12d3-a456-426614174099',
      };

      const response = await client.deleteTask(request);

      expect(response.success).toBe(true);
    });
  });

  describe('AssignTask', () => {
    it('should assign task to user', async () => {
      const request: AssignTaskRequest = {
        taskId: '123e4567-e89b-12d3-a456-426614174002',
        assigneeId: '123e4567-e89b-12d3-a456-426614174001',
      };

      const response = await client.assignTask(request);

      expect(response.task?.assigneeId).toBe('123e4567-e89b-12d3-a456-426614174001');
    });

    it('should unassign task when assigneeId is null', async () => {
      const request: AssignTaskRequest = {
        taskId: '123e4567-e89b-12d3-a456-426614174002',
        assigneeId: undefined,
      };

      const response = await client.assignTask(request);

      expect(response.task?.assigneeId).toBeUndefined();
    });
  });

  describe('AddSubtask', () => {
    it('should add a subtask to parent task', async () => {
      const request: AddSubtaskRequest = {
        parentTaskId: '123e4567-e89b-12d3-a456-426614174002',
        title: 'Subtask 1',
        description: 'Subtask description',
      };

      const response = await client.addSubtask(request);

      expect(response.subtask).toBeDefined();
      expect(response.subtask?.parentTaskId).toBe('123e4567-e89b-12d3-a456-426614174002');
      expect(response.subtask?.title).toBe('Subtask 1');
    });
  });
});
