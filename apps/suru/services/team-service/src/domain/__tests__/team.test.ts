/**
 * Team Entity Tests
 */

import { describe, expect, it } from 'vitest';
import { Team } from '../entities/team.js';

describe('Team Entity', () => {
	describe('create', () => {
		it('should create a team with required fields', () => {
			const team = Team.create({
				name: 'Engineering Team',
				createdBy: '123e4567-e89b-12d3-a456-426614174001',
			});

			expect(team.name.toString()).toBe('Engineering Team');
			expect(team.description).toBeUndefined();
			expect(team.createdBy).toBe('123e4567-e89b-12d3-a456-426614174001');
			expect(team.memberCount).toBe(1);
			expect(team.version).toBe(0);
		});

		it('should create a team with description', () => {
			const team = Team.create({
				name: 'Engineering Team',
				description: 'Core engineering team',
				createdBy: '123e4567-e89b-12d3-a456-426614174001',
			});

			expect(team.description).toBe('Core engineering team');
		});

		it('should automatically add creator as owner', () => {
			const team = Team.create({
				name: 'Engineering Team',
				createdBy: '123e4567-e89b-12d3-a456-426614174001',
			});

			const creator = team.getMember('123e4567-e89b-12d3-a456-426614174001');
			expect(creator).toBeDefined();
			expect(creator?.isOwner()).toBe(true);
		});

		it('should reject empty name', () => {
			expect(() =>
				Team.create({
					name: '',
					createdBy: '123e4567-e89b-12d3-a456-426614174001',
				}),
			).toThrow('Team name is required');
		});

		it('should reject name longer than 100 characters', () => {
			expect(() =>
				Team.create({
					name: 'a'.repeat(101),
					createdBy: '123e4567-e89b-12d3-a456-426614174001',
				}),
			).toThrow('Team name must be between 1 and 100 characters');
		});
	});

	describe('updateDetails', () => {
		it('should update team name', () => {
			const team = Team.create({
				name: 'Engineering Team',
				createdBy: '123e4567-e89b-12d3-a456-426614174001',
			});

			team.updateDetails({ name: 'Updated Team' });

			expect(team.name.toString()).toBe('Updated Team');
			expect(team.version).toBe(1);
		});

		it('should update team description', () => {
			const team = Team.create({
				name: 'Engineering Team',
				createdBy: '123e4567-e89b-12d3-a456-426614174001',
			});

			team.updateDetails({ description: 'New description' });

			expect(team.description).toBe('New description');
			expect(team.version).toBe(1);
		});
	});

	describe('addMember', () => {
		it('should add a new member', () => {
			const team = Team.create({
				name: 'Engineering Team',
				createdBy: '123e4567-e89b-12d3-a456-426614174001',
			});

			team.addMember({
				userId: '123e4567-e89b-12d3-a456-426614174002',
				role: 'MEMBER',
				addedBy: '123e4567-e89b-12d3-a456-426614174001',
			});

			expect(team.memberCount).toBe(2);
			expect(
				team.isMember('123e4567-e89b-12d3-a456-426614174002'),
			).toBe(true);
			expect(team.version).toBe(1);
		});

		it('should reject adding duplicate member', () => {
			const team = Team.create({
				name: 'Engineering Team',
				createdBy: '123e4567-e89b-12d3-a456-426614174001',
			});

			expect(() =>
				team.addMember({
					userId: '123e4567-e89b-12d3-a456-426614174001',
					role: 'MEMBER',
					addedBy: '123e4567-e89b-12d3-a456-426614174001',
				}),
			).toThrow('User is already a member of this team');
		});

		it('should reject non-admin adding members', () => {
			const team = Team.create({
				name: 'Engineering Team',
				createdBy: '123e4567-e89b-12d3-a456-426614174001',
			});

			team.addMember({
				userId: '123e4567-e89b-12d3-a456-426614174002',
				role: 'MEMBER',
				addedBy: '123e4567-e89b-12d3-a456-426614174001',
			});

			expect(() =>
				team.addMember({
					userId: '123e4567-e89b-12d3-a456-426614174003',
					role: 'MEMBER',
					addedBy: '123e4567-e89b-12d3-a456-426614174002',
				}),
			).toThrow('Only owner or admin can add members');
		});
	});

	describe('removeMember', () => {
		it('should remove a member', () => {
			const team = Team.create({
				name: 'Engineering Team',
				createdBy: '123e4567-e89b-12d3-a456-426614174001',
			});

			team.addMember({
				userId: '123e4567-e89b-12d3-a456-426614174002',
				role: 'MEMBER',
				addedBy: '123e4567-e89b-12d3-a456-426614174001',
			});

			team.removeMember({
				userId: '123e4567-e89b-12d3-a456-426614174002',
				removedBy: '123e4567-e89b-12d3-a456-426614174001',
			});

			expect(team.memberCount).toBe(1);
			expect(
				team.isMember('123e4567-e89b-12d3-a456-426614174002'),
			).toBe(false);
			expect(team.version).toBe(2);
		});

		it('should reject removing owner', () => {
			const team = Team.create({
				name: 'Engineering Team',
				createdBy: '123e4567-e89b-12d3-a456-426614174001',
			});

			expect(() =>
				team.removeMember({
					userId: '123e4567-e89b-12d3-a456-426614174001',
					removedBy: '123e4567-e89b-12d3-a456-426614174001',
				}),
			).toThrow('Cannot remove team owner');
		});

		it('should reject non-admin removing members', () => {
			const team = Team.create({
				name: 'Engineering Team',
				createdBy: '123e4567-e89b-12d3-a456-426614174001',
			});

			team.addMember({
				userId: '123e4567-e89b-12d3-a456-426614174002',
				role: 'MEMBER',
				addedBy: '123e4567-e89b-12d3-a456-426614174001',
			});

			team.addMember({
				userId: '123e4567-e89b-12d3-a456-426614174003',
				role: 'MEMBER',
				addedBy: '123e4567-e89b-12d3-a456-426614174001',
			});

			expect(() =>
				team.removeMember({
					userId: '123e4567-e89b-12d3-a456-426614174003',
					removedBy: '123e4567-e89b-12d3-a456-426614174002',
				}),
			).toThrow('Only owner or admin can remove members');
		});
	});

	describe('changeMemberRole', () => {
		it('should change member role', () => {
			const team = Team.create({
				name: 'Engineering Team',
				createdBy: '123e4567-e89b-12d3-a456-426614174001',
			});

			team.addMember({
				userId: '123e4567-e89b-12d3-a456-426614174002',
				role: 'MEMBER',
				addedBy: '123e4567-e89b-12d3-a456-426614174001',
			});

			team.changeMemberRole({
				userId: '123e4567-e89b-12d3-a456-426614174002',
				newRole: 'ADMIN',
				changedBy: '123e4567-e89b-12d3-a456-426614174001',
			});

			const member = team.getMember('123e4567-e89b-12d3-a456-426614174002');
			expect(member?.role.toString()).toBe('ADMIN');
			expect(team.version).toBe(2);
		});

		it('should reject changing owner role', () => {
			const team = Team.create({
				name: 'Engineering Team',
				createdBy: '123e4567-e89b-12d3-a456-426614174001',
			});

			expect(() =>
				team.changeMemberRole({
					userId: '123e4567-e89b-12d3-a456-426614174001',
					newRole: 'ADMIN',
					changedBy: '123e4567-e89b-12d3-a456-426614174001',
				}),
			).toThrow('Cannot change owner role');
		});
	});

	describe('toObject', () => {
		it('should convert team to plain object', () => {
			const team = Team.create({
				name: 'Engineering Team',
				description: 'Core team',
				createdBy: '123e4567-e89b-12d3-a456-426614174001',
			});

			const obj = team.toObject();

			expect(obj.name).toBe('Engineering Team');
			expect(obj.description).toBe('Core team');
			expect(obj.createdBy).toBe('123e4567-e89b-12d3-a456-426614174001');
			expect(obj.members).toHaveLength(1);
			expect(obj.members[0].role).toBe('OWNER');
		});
	});
});
