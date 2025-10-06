/**
 * TeamRole Value Object
 */

import { TeamRole as TeamRoleEnum, ValidationError } from '@noos/suru-types';

export class TeamRole {
	private readonly value: TeamRoleEnum;

	private constructor(value: TeamRoleEnum) {
		this.value = value;
	}

	static create(role: string): TeamRole {
		if (!Object.values(TeamRoleEnum).includes(role as TeamRoleEnum)) {
			throw new ValidationError(`Invalid team role: ${role}`);
		}
		return new TeamRole(role as TeamRoleEnum);
	}

	static OWNER(): TeamRole {
		return new TeamRole(TeamRoleEnum.OWNER);
	}

	static ADMIN(): TeamRole {
		return new TeamRole(TeamRoleEnum.ADMIN);
	}

	static MEMBER(): TeamRole {
		return new TeamRole(TeamRoleEnum.MEMBER);
	}

	toString(): string {
		return this.value;
	}

	equals(other: TeamRole): boolean {
		return this.value === other.value;
	}

	/**
	 * Check if this role can manage members
	 */
	canManageMembers(): boolean {
		return this.value === TeamRoleEnum.OWNER || this.value === TeamRoleEnum.ADMIN;
	}

	/**
	 * Check if this role can manage projects
	 */
	canManageProjects(): boolean {
		return this.value === TeamRoleEnum.OWNER || this.value === TeamRoleEnum.ADMIN;
	}

	/**
	 * Check if this role can delete the team
	 */
	canDeleteTeam(): boolean {
		return this.value === TeamRoleEnum.OWNER;
	}
}
