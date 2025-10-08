/**
 * Prisma Task Repository Implementation
 */

import { PrismaClient } from '@noos/suru-db';
import type { TaskRepository, TaskFilters } from '../../domain/repositories/task-repository';
import { Task } from '../../domain/entities/task';
import { TaskId } from '../../domain/value-objects/task-id';
import { ValidationError } from '@noos/suru-types';

export class PrismaTaskRepository implements TaskRepository {
  constructor(private prisma: PrismaClient) {}

  async save(task: Task): Promise<void> {
    const exists = await this.exists(TaskId.create(task.id));

    const data = {
      id: task.id,
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate,
      projectId: task.projectId,
      assigneeId: task.assigneeId,
      parentTaskId: task.parentTaskId,
      createdBy: task.createdBy,
      version: task.version,
    };

    if (exists) {
      // Update with optimistic locking
      try {
        await this.prisma.task.update({
          where: {
            id: task.id,
            version: task.version - 1, // Check previous version
          },
          data: {
            ...data,
            updatedAt: new Date(),
          },
        });
      } catch (error) {
        throw new ValidationError('Task version conflict - task was modified by another process');
      }
    } else {
      // Create new task
      await this.prisma.task.create({
        data: {
          ...data,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });
    }
  }

  async findById(id: TaskId, includeSubtasks = false): Promise<Task | null> {
    const task = await this.prisma.task.findUnique({
      where: { id: id.toString() },
      include: {
        subtasks: includeSubtasks,
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });

    if (!task) {
      return null;
    }

    return Task.reconstitute({
      id: task.id,
      title: task.title,
      description: task.description ?? undefined,
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate ?? undefined,
      projectId: task.projectId,
      assigneeId: task.assigneeId ?? undefined,
      parentTaskId: task.parentTaskId ?? undefined,
      createdBy: task.createdBy,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
      version: task.version,
      tags: task.tags.map((t) => t.tag.name),
      subtaskIds: includeSubtasks ? task.subtasks.map((s) => s.id) : undefined,
    });
  }

  async findMany(filters: TaskFilters): Promise<{
    tasks: Task[];
    totalCount: number;
  }> {
    const page = filters.page ?? 1;
    const pageSize = filters.pageSize ?? 20;
    const skip = (page - 1) * pageSize;

    const where = {
      projectId: filters.projectId,
      ...(filters.status && { status: filters.status }),
      ...(filters.assigneeId && { assigneeId: filters.assigneeId }),
      ...(filters.tags &&
        filters.tags.length > 0 && {
          tags: {
            some: {
              tag: {
                name: {
                  in: filters.tags,
                },
              },
            },
          },
        }),
    };

    const orderBy = {};
    if (filters.sortBy) {
      orderBy[filters.sortBy] = filters.sortOrder ?? 'asc';
    } else {
      orderBy.createdAt = 'desc';
    }

    const [tasks, totalCount] = await Promise.all([
      this.prisma.task.findMany({
        where,
        orderBy,
        skip,
        take: pageSize,
        include: {
          tags: {
            include: {
              tag: true,
            },
          },
        },
      }),
      this.prisma.task.count({ where }),
    ]);

    return {
      tasks: tasks.map((task) =>
        Task.reconstitute({
          id: task.id,
          title: task.title,
          description: task.description ?? undefined,
          status: task.status,
          priority: task.priority,
          dueDate: task.dueDate ?? undefined,
          projectId: task.projectId,
          assigneeId: task.assigneeId ?? undefined,
          parentTaskId: task.parentTaskId ?? undefined,
          createdBy: task.createdBy,
          createdAt: task.createdAt,
          updatedAt: task.updatedAt,
          version: task.version,
          tags: task.tags.map((t) => t.tag.name),
        }),
      ),
      totalCount,
    };
  }

  async delete(id: TaskId): Promise<void> {
    await this.prisma.task.delete({
      where: { id: id.toString() },
    });
  }

  async exists(id: TaskId): Promise<boolean> {
    const count = await this.prisma.task.count({
      where: { id: id.toString() },
    });
    return count > 0;
  }
}
