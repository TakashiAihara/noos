/**
 * Project Entity
 */

import { ValidationError } from '@noos/suru-types';
import { ProjectId, ProjectName, TeamId } from '../value-objects/index.js';

export interface ProjectProps {
	id: ProjectId;
	name: ProjectName;
	description?: string;
	teamId: TeamId;
	archived: boolean;
	createdBy: string;
	createdAt: Date;
	updatedAt: Date;
	version: number;
}

export class Project {
	private props: ProjectProps;

	private constructor(props: ProjectProps) {
		this.props = props;
	}

	static create(params: {
		name: string;
		description?: string;
		teamId: string;
		createdBy: string;
	}): Project {
		const projectId = ProjectId.generate();
		const projectName = ProjectName.create(params.name);
		const teamId = TeamId.create(params.teamId);

		const now = new Date();

		return new Project({
			id: projectId,
			name: projectName,
			description: params.description,
			teamId,
			archived: false,
			createdBy: params.createdBy,
			createdAt: now,
			updatedAt: now,
			version: 0,
		});
	}

	/**
	 * Update project details
	 */
	updateDetails(params: { name?: string; description?: string }): void {
		if (this.props.archived) {
			throw new ValidationError('Cannot update archived project');
		}

		if (params.name) {
			this.props.name = ProjectName.create(params.name);
		}

		if (params.description !== undefined) {
			this.props.description = params.description;
		}

		this.props.updatedAt = new Date();
		this.props.version++;
	}

	/**
	 * Archive the project
	 */
	archive(): void {
		if (this.props.archived) {
			throw new ValidationError('Project is already archived');
		}

		this.props.archived = true;
		this.props.updatedAt = new Date();
		this.props.version++;
	}

	/**
	 * Unarchive the project
	 */
	unarchive(): void {
		if (!this.props.archived) {
			throw new ValidationError('Project is not archived');
		}

		this.props.archived = false;
		this.props.updatedAt = new Date();
		this.props.version++;
	}

	// Getters
	get id(): ProjectId {
		return this.props.id;
	}

	get name(): ProjectName {
		return this.props.name;
	}

	get description(): string | undefined {
		return this.props.description;
	}

	get teamId(): TeamId {
		return this.props.teamId;
	}

	get archived(): boolean {
		return this.props.archived;
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

	toObject(): {
		id: string;
		name: string;
		description?: string;
		teamId: string;
		archived: boolean;
		createdBy: string;
		createdAt: Date;
		updatedAt: Date;
		version: number;
	} {
		return {
			id: this.props.id.toString(),
			name: this.props.name.toString(),
			description: this.props.description,
			teamId: this.props.teamId.toString(),
			archived: this.props.archived,
			createdBy: this.props.createdBy,
			createdAt: this.props.createdAt,
			updatedAt: this.props.updatedAt,
			version: this.props.version,
		};
	}
}
