/**
 * Team Entity (Aggregate Root)
 */

import { ValidationError } from '@noos/suru-types';
import { TeamId, TeamName } from '../value-objects/index.js';
import { TeamMember } from './team-member.js';

export interface TeamProps {
	id: TeamId;
	name: TeamName;
	description?: string;
	createdBy: string;
	createdAt: Date;
	updatedAt: Date;
	version: number;
}

export class Team {
	private props: TeamProps;
	private members: TeamMember[] = [];

	private constructor(props: TeamProps) {
		this.props = props;
	}

	static create(params: {
		name: string;
		description?: string;
		createdBy: string;
	}): Team {
		const teamId = TeamId.generate();
		const teamName = TeamName.create(params.name);

		const now = new Date();

		const team = new Team({
			id: teamId,
			name: teamName,
			description: params.description,
			createdBy: params.createdBy,
			createdAt: now,
			updatedAt: now,
			version: 0,
		});

		// Add creator as owner
		const ownerMember = TeamMember.create({
			userId: params.createdBy,
			teamId: teamId.toString(),
			role: 'OWNER',
		});
		team.members.push(ownerMember);

		return team;
	}

	/**
	 * Update team details
	 */
	updateDetails(params: { name?: string; description?: string }): void {
		if (params.name) {
			this.props.name = TeamName.create(params.name);
		}

		if (params.description !== undefined) {
			this.props.description = params.description;
		}

		this.props.updatedAt = new Date();
		this.props.version++;
	}

	/**
	 * Add a member to the team
	 */
	addMember(params: { userId: string; role: string; addedBy: string }): void {
		// Check if user already exists
		if (this.members.some((m) => m.userId === params.userId)) {
			throw new ValidationError('User is already a member of this team');
		}

		// Check if addedBy has permission
		const adderMember = this.members.find((m) => m.userId === params.addedBy);
		if (!adderMember || !adderMember.canManageMembers()) {
			throw new ValidationError('Only owner or admin can add members');
		}

		const newMember = TeamMember.create({
			userId: params.userId,
			teamId: this.props.id.toString(),
			role: params.role,
		});

		this.members.push(newMember);
		this.props.updatedAt = new Date();
		this.props.version++;
	}

	/**
	 * Remove a member from the team
	 */
	removeMember(params: { userId: string; removedBy: string }): void {
		const memberToRemove = this.members.find((m) => m.userId === params.userId);
		if (!memberToRemove) {
			throw new ValidationError('User is not a member of this team');
		}

		// Cannot remove owner
		if (memberToRemove.isOwner()) {
			throw new ValidationError('Cannot remove team owner');
		}

		// Check if removedBy has permission
		const removerMember = this.members.find((m) => m.userId === params.removedBy);
		if (!removerMember || !removerMember.canManageMembers()) {
			throw new ValidationError('Only owner or admin can remove members');
		}

		this.members = this.members.filter((m) => m.userId !== params.userId);
		this.props.updatedAt = new Date();
		this.props.version++;
	}

	/**
	 * Change member role
	 */
	changeMemberRole(params: { userId: string; newRole: string; changedBy: string }): void {
		const member = this.members.find((m) => m.userId === params.userId);
		if (!member) {
			throw new ValidationError('User is not a member of this team');
		}

		// Only owner can change owner role
		if (member.isOwner()) {
			throw new ValidationError('Cannot change owner role');
		}

		// Check if changedBy has permission
		const changerMember = this.members.find((m) => m.userId === params.changedBy);
		if (!changerMember || !changerMember.canManageMembers()) {
			throw new ValidationError('Only owner or admin can change member roles');
		}

		member.changeRole(params.newRole);
		this.props.updatedAt = new Date();
		this.props.version++;
	}

	/**
	 * Get member by user ID
	 */
	getMember(userId: string): TeamMember | undefined {
		return this.members.find((m) => m.userId === userId);
	}

	/**
	 * Check if user is a member
	 */
	isMember(userId: string): boolean {
		return this.members.some((m) => m.userId === userId);
	}

	// Getters
	get id(): TeamId {
		return this.props.id;
	}

	get name(): TeamName {
		return this.props.name;
	}

	get description(): string | undefined {
		return this.props.description;
	}

	get createdBy(): string {
		return this.props.createdBy;
	}

	get createdAt(): Date {
		return this.props.createdAt;
	}

	get updatedAt(): Date {
		return this.props.updatedAt;
	}

	get version(): number {
		return this.props.version;
	}

	get memberCount(): number {
		return this.members.length;
	}

	getMembers(): TeamMember[] {
		return [...this.members];
	}

	toObject(): {
		id: string;
		name: string;
		description?: string;
		createdBy: string;
		createdAt: Date;
		updatedAt: Date;
		version: number;
		members: ReturnType<TeamMember['toObject']>[];
	} {
		return {
			id: this.props.id.toString(),
			name: this.props.name.toString(),
			description: this.props.description,
			createdBy: this.props.createdBy,
			createdAt: this.props.createdAt,
			updatedAt: this.props.updatedAt,
			version: this.props.version,
			members: this.members.map((m) => m.toObject()),
		};
	}
}
