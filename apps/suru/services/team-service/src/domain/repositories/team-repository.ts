/**
 * TeamRepository Interface (Port)
 */

import { Team } from '../entities/index.js';
import { TeamId } from '../value-objects/index.js';

export interface TeamFilters {
	createdBy?: string;
	memberUserId?: string;
	limit?: number;
	offset?: number;
}

export interface TeamRepository {
	/**
	 * Save team (create or update)
	 */
	save(team: Team): Promise<void>;

	/**
	 * Find team by ID
	 */
	findById(id: TeamId, includeMembers?: boolean): Promise<Team | null>;

	/**
	 * Find teams with filters
	 */
	findMany(filters: TeamFilters): Promise<{
		teams: Team[];
		totalCount: number;
	}>;

	/**
	 * Delete team
	 */
	delete(id: TeamId): Promise<void>;

	/**
	 * Check if team exists
	 */
	exists(id: TeamId): Promise<boolean>;
}
