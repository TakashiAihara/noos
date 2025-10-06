/**
 * Task Entity Unit Tests
 */

import { describe, it, expect } from 'vitest';
import { Task } from '../entities/task';
import { TaskTitle, TaskStatus, Priority } from '../value-objects';

describe('Task Entity', () => {
  describe('create', () => {
    it('should create a task with required fields', () => {
      const task = Task.create({
        projectId: '123e4567-e89b-12d3-a456-426614174000',
        title: 'Test Task',
        createdBy: '123e4567-e89b-12d3-a456-426614174001',
      });

      expect(task.id).toBeDefined();
      expect(task.title.toString()).toBe('Test Task');
      expect(task.status.toString()).toBe('TODO');
      expect(task.priority.toString()).toBe('MEDIUM');
      expect(task.projectId).toBe('123e4567-e89b-12d3-a456-426614174000');
      expect(task.version).toBe(0);
    });

    it('should create a task with all optional fields', () => {
      const dueDate = new Date('2025-12-31');
      const task = Task.create({
        projectId: '123e4567-e89b-12d3-a456-426614174000',
        title: 'Full Task',
        description: 'Task with all fields',
        priority: 'HIGH',
        dueDate,
        tags: ['backend', 'urgent'],
        assigneeId: '123e4567-e89b-12d3-a456-426614174002',
        createdBy: '123e4567-e89b-12d3-a456-426614174001',
      });

      expect(task.description).toBe('Task with all fields');
      expect(task.priority.toString()).toBe('HIGH');
      expect(task.dueDate).toEqual(dueDate);
      expect(task.tags).toEqual(['backend', 'urgent']);
      expect(task.assigneeId).toBe('123e4567-e89b-12d3-a456-426614174002');
    });

    it('should reject empty title', () => {
      expect(() =>
        Task.create({
          projectId: '123e4567-e89b-12d3-a456-426614174000',
          title: '',
          createdBy: '123e4567-e89b-12d3-a456-426614174001',
        })
      ).toThrow('Task title is required');
    });

    it('should reject title longer than 200 characters', () => {
      expect(() =>
        Task.create({
          projectId: '123e4567-e89b-12d3-a456-426614174000',
          title: 'a'.repeat(201),
          createdBy: '123e4567-e89b-12d3-a456-426614174001',
        })
      ).toThrow('Task title must be between 1 and 200 characters');
    });

    it('should reject invalid priority', () => {
      expect(() =>
        Task.create({
          projectId: '123e4567-e89b-12d3-a456-426614174000',
          title: 'Test',
          priority: 'INVALID',
          createdBy: '123e4567-e89b-12d3-a456-426614174001',
        })
      ).toThrow('Invalid priority: INVALID');
    });
  });

  describe('updateDetails', () => {
    it('should update task title', () => {
      const task = Task.create({
        projectId: '123e4567-e89b-12d3-a456-426614174000',
        title: 'Original Title',
        createdBy: '123e4567-e89b-12d3-a456-426614174001',
      });

      const originalVersion = task.version;
      task.updateDetails({ title: 'Updated Title' });

      expect(task.title.toString()).toBe('Updated Title');
      expect(task.version).toBe(originalVersion + 1);
    });

    it('should update multiple fields', () => {
      const task = Task.create({
        projectId: '123e4567-e89b-12d3-a456-426614174000',
        title: 'Task',
        createdBy: '123e4567-e89b-12d3-a456-426614174001',
      });

      task.updateDetails({
        title: 'New Title',
        description: 'New description',
        priority: 'HIGH',
        tags: ['new-tag'],
      });

      expect(task.title.toString()).toBe('New Title');
      expect(task.description).toBe('New description');
      expect(task.priority.toString()).toBe('HIGH');
      expect(task.tags).toEqual(['new-tag']);
    });
  });

  describe('changeStatus', () => {
    it('should change status from TODO to IN_PROGRESS', () => {
      const task = Task.create({
        projectId: '123e4567-e89b-12d3-a456-426614174000',
        title: 'Task',
        createdBy: '123e4567-e89b-12d3-a456-426614174001',
      });

      const originalVersion = task.version;
      task.changeStatus('IN_PROGRESS');

      expect(task.status.toString()).toBe('IN_PROGRESS');
      expect(task.version).toBe(originalVersion + 1);
    });

    it('should allow status change from IN_PROGRESS to DONE', () => {
      const task = Task.create({
        projectId: '123e4567-e89b-12d3-a456-426614174000',
        title: 'Task',
        createdBy: '123e4567-e89b-12d3-a456-426614174001',
      });

      task.changeStatus('IN_PROGRESS');
      task.changeStatus('DONE');

      expect(task.status.toString()).toBe('DONE');
    });

    it('should allow reopening from DONE to TODO', () => {
      const task = Task.create({
        projectId: '123e4567-e89b-12d3-a456-426614174000',
        title: 'Task',
        createdBy: '123e4567-e89b-12d3-a456-426614174001',
      });

      task.changeStatus('DONE');
      task.changeStatus('TODO');

      expect(task.status.toString()).toBe('TODO');
    });
  });

  describe('assignTo', () => {
    it('should assign task to user', () => {
      const task = Task.create({
        projectId: '123e4567-e89b-12d3-a456-426614174000',
        title: 'Task',
        createdBy: '123e4567-e89b-12d3-a456-426614174001',
      });

      const originalVersion = task.version;
      task.assignTo('123e4567-e89b-12d3-a456-426614174002');

      expect(task.assigneeId).toBe('123e4567-e89b-12d3-a456-426614174002');
      expect(task.version).toBe(originalVersion + 1);
    });

    it('should unassign task', () => {
      const task = Task.create({
        projectId: '123e4567-e89b-12d3-a456-426614174000',
        title: 'Task',
        assigneeId: '123e4567-e89b-12d3-a456-426614174002',
        createdBy: '123e4567-e89b-12d3-a456-426614174001',
      });

      task.assignTo(undefined);

      expect(task.assigneeId).toBeUndefined();
    });
  });

  describe('addSubtask', () => {
    it('should add subtask to parent task', () => {
      const parentTask = Task.create({
        projectId: '123e4567-e89b-12d3-a456-426614174000',
        title: 'Parent Task',
        createdBy: '123e4567-e89b-12d3-a456-426614174001',
      });

      const subtask = Task.create({
        projectId: '123e4567-e89b-12d3-a456-426614174000',
        title: 'Subtask',
        parentTaskId: parentTask.id.toString(),
        createdBy: '123e4567-e89b-12d3-a456-426614174001',
      });

      parentTask.addSubtask(subtask);

      expect(parentTask.getSubtasks()).toHaveLength(1);
      expect(parentTask.getSubtasks()[0].id).toEqual(subtask.id);
    });

    it('should reject adding subtask to a subtask (max 1 level)', () => {
      const parentTask = Task.create({
        projectId: '123e4567-e89b-12d3-a456-426614174000',
        title: 'Parent Task',
        createdBy: '123e4567-e89b-12d3-a456-426614174001',
      });

      const subtask = Task.create({
        projectId: '123e4567-e89b-12d3-a456-426614174000',
        title: 'Subtask',
        parentTaskId: parentTask.id.toString(),
        createdBy: '123e4567-e89b-12d3-a456-426614174001',
      });

      const nestedSubtask = Task.create({
        projectId: '123e4567-e89b-12d3-a456-426614174000',
        title: 'Nested Subtask',
        parentTaskId: subtask.id.toString(),
        createdBy: '123e4567-e89b-12d3-a456-426614174001',
      });

      expect(() => subtask.addSubtask(nestedSubtask)).toThrow(
        'Cannot add subtask to a subtask'
      );
    });
  });

  describe('toObject', () => {
    it('should convert task to plain object', () => {
      const task = Task.create({
        projectId: '123e4567-e89b-12d3-a456-426614174000',
        title: 'Task',
        description: 'Description',
        priority: 'HIGH',
        tags: ['tag1', 'tag2'],
        createdBy: '123e4567-e89b-12d3-a456-426614174001',
      });

      const obj = task.toObject();

      expect(obj.id).toBe(task.id.toString());
      expect(obj.title).toBe('Task');
      expect(obj.description).toBe('Description');
      expect(obj.status).toBe('TODO');
      expect(obj.priority).toBe('HIGH');
      expect(obj.tags).toEqual(['tag1', 'tag2']);
      expect(obj.version).toBe(0);
    });
  });
});
