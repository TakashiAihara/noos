/**
 * ProjectRepository Interface (Port)
 */

import { Project } from '../entities/index.js';
import { ProjectId, TeamId } from '../value-objects/index.js';

export interface ProjectFilters {
	teamId?: string;
	createdBy?: string;
	archived?: boolean;
	limit?: number;
	offset?: number;
}

export interface ProjectRepository {
	/**
	 * Save project (create or update)
	 */
	save(project: Project): Promise<void>;

	/**
	 * Find project by ID
	 */
	findById(id: ProjectId): Promise<Project | null>;

	/**
	 * Find projects with filters
	 */
	findMany(filters: ProjectFilters): Promise<{
		projects: Project[];
		totalCount: number;
	}>;

	/**
	 * Delete project
	 */
	delete(id: ProjectId): Promise<void>;

	/**
	 * Check if project exists
	 */
	exists(id: ProjectId): Promise<boolean>;
}
