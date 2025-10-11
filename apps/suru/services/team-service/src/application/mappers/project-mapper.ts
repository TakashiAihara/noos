/**
 * Project Mapper - Converts Project entity to DTO
 */

import type { Project } from '../../domain/entities/project';

export interface ProjectDTO {
  id: string;
  name: string;
  description?: string;
  teamId: string;
  archived: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  version: number;
}

export function projectToDTO(project: Project): ProjectDTO {
  return {
    id: project.id.toString(),
    name: project.name.toString(),
    description: project.description,
    teamId: project.teamId.toString(),
    archived: project.archived,
    createdBy: project.createdBy,
    createdAt: project.createdAt,
    updatedAt: project.updatedAt,
    version: project.version,
  };
}
