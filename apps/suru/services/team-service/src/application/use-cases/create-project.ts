/**
 * Create Project Use Case
 */

import { Project } from '../../domain/entities/project.js';
import type { ProjectRepository } from '../../domain/repositories/project-repository.js';

export interface CreateProjectInput {
  name: string;
  description?: string;
  teamId: string;
  createdBy: string;
}

export interface CreateProjectOutput {
  projectId: string;
}

export class CreateProjectUseCase {
  constructor(private projectRepository: ProjectRepository) {}

  async execute(input: CreateProjectInput): Promise<CreateProjectOutput> {
    const project = Project.create({
      name: input.name,
      description: input.description,
      teamId: input.teamId,
      createdBy: input.createdBy,
    });

    await this.projectRepository.save(project);

    return { projectId: project.id.toString() };
  }
}
