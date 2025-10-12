/**
 * Delete Project Use Case
 */

import type { ProjectRepository } from '../../domain/repositories/project-repository.js';
import { ProjectId } from '../../domain/value-objects/index.js';

export interface DeleteProjectInput {
  projectId: string;
}

export interface DeleteProjectOutput {
  success: boolean;
}

export class DeleteProjectUseCase {
  constructor(private projectRepository: ProjectRepository) {}

  async execute(input: DeleteProjectInput): Promise<DeleteProjectOutput> {
    const projectId = ProjectId.create(input.projectId);
    const project = await this.projectRepository.findById(projectId);

    if (!project) {
      throw new Error(`Project with id ${input.projectId} not found`);
    }

    await this.projectRepository.delete(projectId);

    return { success: true };
  }
}
