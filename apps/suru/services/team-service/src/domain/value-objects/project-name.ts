/**
 * ProjectName Value Object
 */

import { validateLength, validateRequired } from '@noos/suru-utils';

export class ProjectName {
	private readonly value: string;

	private constructor(value: string) {
		this.value = value;
	}

	static create(name: string): ProjectName {
		validateRequired(name, 'Project name');
		validateLength(name, 1, 100, 'Project name');
		return new ProjectName(name.trim());
	}

	toString(): string {
		return this.value;
	}

	equals(other: ProjectName): boolean {
		return this.value === other.value;
	}
}
