/**
 * Get Project Use Case
 */

import type { ProjectRepository } from '../../domain/repositories/project-repository.js';
import { ProjectId } from '../../domain/value-objects/index.js';
import { type ProjectDTO, projectToDTO } from '../mappers/project-mapper.js';

export interface GetProjectInput {
  projectId: string;
}

export interface GetProjectOutput {
  project: ProjectDTO;
}

export class GetProjectUseCase {
  constructor(private projectRepository: ProjectRepository) {}

  async execute(input: GetProjectInput): Promise<GetProjectOutput> {
    const projectId = ProjectId.create(input.projectId);
    const project = await this.projectRepository.findById(projectId);

    if (!project) {
      throw new Error(`Project with id ${input.projectId} not found`);
    }

    return {
      project: projectToDTO(project),
    };
  }
}
