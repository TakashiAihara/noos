/**
 * Archive Project Use Case
 */

import type { ProjectRepository } from '../../domain/repositories/project-repository.js';
import { ProjectId } from '../../domain/value-objects/index.js';
import { type ProjectDTO, projectToDTO } from '../mappers/project-mapper.js';

export interface ArchiveProjectInput {
  projectId: string;
}

export interface ArchiveProjectOutput {
  project: ProjectDTO;
}

export class ArchiveProjectUseCase {
  constructor(private projectRepository: ProjectRepository) {}

  async execute(input: ArchiveProjectInput): Promise<ArchiveProjectOutput> {
    const projectId = ProjectId.create(input.projectId);
    const project = await this.projectRepository.findById(projectId);

    if (!project) {
      throw new Error(`Project with id ${input.projectId} not found`);
    }

    // Archive project using entity method
    project.archive();

    await this.projectRepository.save(project);

    return {
      project: projectToDTO(project),
    };
  }
}
