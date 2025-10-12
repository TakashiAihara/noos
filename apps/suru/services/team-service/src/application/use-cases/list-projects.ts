/**
 * List Projects Use Case
 */

import type { ProjectRepository } from '../../domain/repositories/project-repository.js';
import { type ProjectDTO, projectToDTO } from '../mappers/project-mapper.js';

export interface ListProjectsInput {
  teamId: string;
  archived?: boolean;
  page?: number;
  pageSize?: number;
}

export interface ListProjectsOutput {
  projects: ProjectDTO[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export class ListProjectsUseCase {
  constructor(private projectRepository: ProjectRepository) {}

  async execute(input: ListProjectsInput): Promise<ListProjectsOutput> {
    const page = input.page ?? 1;
    const pageSize = input.pageSize ?? 20;
    const offset = (page - 1) * pageSize;

    // Use findMany with filters
    const result = await this.projectRepository.findMany({
      teamId: input.teamId,
      archived: input.archived,
      limit: pageSize,
      offset,
    });

    return {
      projects: result.projects.map((project) => projectToDTO(project)),
      totalCount: result.totalCount,
      page,
      pageSize,
    };
  }
}
