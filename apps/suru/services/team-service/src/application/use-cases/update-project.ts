/**
 * Update Project Use Case
 */

import type { ProjectRepository } from '../../domain/repositories/project-repository.js';
import { ProjectId } from '../../domain/value-objects/index.js';
import { type ProjectDTO, projectToDTO } from '../mappers/project-mapper.js';

export interface UpdateProjectInput {
  projectId: string;
  name?: string;
  description?: string;
  version: number;
}

export interface UpdateProjectOutput {
  project: ProjectDTO;
}

export class UpdateProjectUseCase {
  constructor(private projectRepository: ProjectRepository) {}

  async execute(input: UpdateProjectInput): Promise<UpdateProjectOutput> {
    const projectId = ProjectId.create(input.projectId);
    const project = await this.projectRepository.findById(projectId);

    if (!project) {
      throw new Error(`Project with id ${input.projectId} not found`);
    }

    // Check version for optimistic locking
    if (project.version !== input.version) {
      throw new Error('Project version conflict - project was modified by another process');
    }

    // Update project details
    project.updateDetails({
      name: input.name,
      description: input.description,
    });

    await this.projectRepository.save(project);

    return {
      project: projectToDTO(project),
    };
  }
}
