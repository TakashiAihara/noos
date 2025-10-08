/**
 * Prisma Project Repository Implementation
 */

import { PrismaClient } from '@noos/suru-db';
import type {
  ProjectRepository,
  ProjectFilters,
} from '../../domain/repositories/project-repository';
import { Project } from '../../domain/entities/project';
import { ProjectId } from '../../domain/value-objects/project-id';
import { ValidationError } from '@noos/suru-types';

export class PrismaProjectRepository implements ProjectRepository {
  constructor(private prisma: PrismaClient) {}

  async save(project: Project): Promise<void> {
    const exists = await this.exists(project.id);

    const data = {
      id: project.id.toString(),
      teamId: project.teamId,
      name: project.name.toString(),
      description: project.description,
      archived: project.archived,
      createdBy: project.createdBy,
      version: project.version,
    };

    if (exists) {
      try {
        await this.prisma.project.update({
          where: {
            id: data.id,
            version: project.version - 1,
          },
          data: {
            ...data,
            updatedAt: new Date(),
          },
        });
      } catch (error) {
        throw new ValidationError(
          'Project version conflict - project was modified by another process',
        );
      }
    } else {
      await this.prisma.project.create({
        data: {
          ...data,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });
    }
  }

  async findById(id: ProjectId): Promise<Project | null> {
    const projectData = await this.prisma.project.findUnique({
      where: { id: id.toString() },
    });

    if (!projectData) {
      return null;
    }

    return Project.reconstitute({
      id: projectData.id,
      teamId: projectData.teamId,
      name: projectData.name,
      description: projectData.description ?? undefined,
      archived: projectData.archived,
      createdBy: projectData.createdBy,
      createdAt: projectData.createdAt,
      updatedAt: projectData.updatedAt,
      version: projectData.version,
    });
  }

  async findMany(filters: ProjectFilters): Promise<{
    projects: Project[];
    totalCount: number;
  }> {
    const where = {
      teamId: filters.teamId,
      ...(filters.archived !== undefined && { archived: filters.archived }),
    };

    const [projects, totalCount] = await Promise.all([
      this.prisma.project.findMany({
        where,
        skip: filters.offset,
        take: filters.limit,
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.project.count({ where }),
    ]);

    return {
      projects: projects.map((p) =>
        Project.reconstitute({
          id: p.id,
          teamId: p.teamId,
          name: p.name,
          description: p.description ?? undefined,
          archived: p.archived,
          createdBy: p.createdBy,
          createdAt: p.createdAt,
          updatedAt: p.updatedAt,
          version: p.version,
        }),
      ),
      totalCount,
    };
  }

  async delete(id: ProjectId): Promise<void> {
    await this.prisma.project.delete({
      where: { id: id.toString() },
    });
  }

  async exists(id: ProjectId): Promise<boolean> {
    const count = await this.prisma.project.count({
      where: { id: id.toString() },
    });
    return count > 0;
  }
}
