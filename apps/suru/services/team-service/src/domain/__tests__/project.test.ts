/**
 * Project Entity Tests
 */

import { describe, expect, it } from 'vitest';
import { Project } from '../entities/project.js';

describe('Project Entity', () => {
  describe('create', () => {
    it('should create a project with required fields', () => {
      const project = Project.create({
        name: 'Website Redesign',
        teamId: '123e4567-e89b-42d3-a456-426614174000',
        createdBy: '123e4567-e89b-42d3-a456-426614174001',
      });

      expect(project.name.toString()).toBe('Website Redesign');
      expect(project.description).toBeUndefined();
      expect(project.archived).toBe(false);
      expect(project.version).toBe(0);
    });

    it('should create a project with description', () => {
      const project = Project.create({
        name: 'Website Redesign',
        description: 'Complete redesign of company website',
        teamId: '123e4567-e89b-42d3-a456-426614174000',
        createdBy: '123e4567-e89b-42d3-a456-426614174001',
      });

      expect(project.description).toBe('Complete redesign of company website');
    });

    it('should reject empty name', () => {
      expect(() =>
        Project.create({
          name: '',
          teamId: '123e4567-e89b-12d3-a456-426614174000',
          createdBy: '123e4567-e89b-12d3-a456-426614174001',
        }),
      ).toThrow('Project name is required');
    });

    it('should reject name longer than 100 characters', () => {
      expect(() =>
        Project.create({
          name: 'a'.repeat(101),
          teamId: '123e4567-e89b-12d3-a456-426614174000',
          createdBy: '123e4567-e89b-12d3-a456-426614174001',
        }),
      ).toThrow('Project name must be between 1 and 100 characters');
    });

    it('should reject invalid team ID', () => {
      expect(() =>
        Project.create({
          name: 'Website Redesign',
          teamId: 'invalid-uuid-format',
          createdBy: '123e4567-e89b-12d3-a456-426614174001',
        }),
      ).toThrow('Invalid UUID format');
    });
  });

  describe('updateDetails', () => {
    it('should update project name', () => {
      const project = Project.create({
        name: 'Website Redesign',
        teamId: '123e4567-e89b-42d3-a456-426614174000',
        createdBy: '123e4567-e89b-42d3-a456-426614174001',
      });

      project.updateDetails({ name: 'Mobile App' });

      expect(project.name.toString()).toBe('Mobile App');
      expect(project.version).toBe(1);
    });

    it('should update project description', () => {
      const project = Project.create({
        name: 'Website Redesign',
        teamId: '123e4567-e89b-42d3-a456-426614174000',
        createdBy: '123e4567-e89b-42d3-a456-426614174001',
      });

      project.updateDetails({ description: 'New description' });

      expect(project.description).toBe('New description');
      expect(project.version).toBe(1);
    });

    it('should reject updating archived project', () => {
      const project = Project.create({
        name: 'Website Redesign',
        teamId: '123e4567-e89b-42d3-a456-426614174000',
        createdBy: '123e4567-e89b-42d3-a456-426614174001',
      });

      project.archive();

      expect(() => project.updateDetails({ name: 'New Name' })).toThrow(
        'Cannot update archived project',
      );
    });
  });

  describe('archive', () => {
    it('should archive a project', () => {
      const project = Project.create({
        name: 'Website Redesign',
        teamId: '123e4567-e89b-42d3-a456-426614174000',
        createdBy: '123e4567-e89b-42d3-a456-426614174001',
      });

      project.archive();

      expect(project.archived).toBe(true);
      expect(project.version).toBe(1);
    });

    it('should reject archiving already archived project', () => {
      const project = Project.create({
        name: 'Website Redesign',
        teamId: '123e4567-e89b-42d3-a456-426614174000',
        createdBy: '123e4567-e89b-42d3-a456-426614174001',
      });

      project.archive();

      expect(() => project.archive()).toThrow('Project is already archived');
    });
  });

  describe('unarchive', () => {
    it('should unarchive a project', () => {
      const project = Project.create({
        name: 'Website Redesign',
        teamId: '123e4567-e89b-42d3-a456-426614174000',
        createdBy: '123e4567-e89b-42d3-a456-426614174001',
      });

      project.archive();
      project.unarchive();

      expect(project.archived).toBe(false);
      expect(project.version).toBe(2);
    });

    it('should reject unarchiving non-archived project', () => {
      const project = Project.create({
        name: 'Website Redesign',
        teamId: '123e4567-e89b-42d3-a456-426614174000',
        createdBy: '123e4567-e89b-42d3-a456-426614174001',
      });

      expect(() => project.unarchive()).toThrow('Project is not archived');
    });
  });

  describe('toObject', () => {
    it('should convert project to plain object', () => {
      const project = Project.create({
        name: 'Website Redesign',
        description: 'Complete redesign',
        teamId: '123e4567-e89b-42d3-a456-426614174000',
        createdBy: '123e4567-e89b-42d3-a456-426614174001',
      });

      const obj = project.toObject();

      expect(obj.name).toBe('Website Redesign');
      expect(obj.description).toBe('Complete redesign');
      expect(obj.teamId).toBe('123e4567-e89b-42d3-a456-426614174000');
      expect(obj.archived).toBe(false);
    });
  });
});
