/**
 * TeamName Value Object
 */

import { validateLength, validateRequired } from '@noos/suru-utils';

export class TeamName {
	private readonly value: string;

	private constructor(value: string) {
		this.value = value;
	}

	static create(name: string): TeamName {
		validateRequired(name, 'Team name');
		validateLength(name, 1, 100, 'Team name');
		return new TeamName(name.trim());
	}

	toString(): string {
		return this.value;
	}

	equals(other: TeamName): boolean {
		return this.value === other.value;
	}
}
