/**
 * List Tasks Use Case
 */

import type { TaskRepository } from '../../domain/repositories/task-repository';
import { type TaskDTO, taskToDTO } from '../mappers/task-mapper';

export interface ListTasksInput {
  projectId: string;
  status?: string;
  assigneeId?: string;
  tags?: string[];
  page?: number;
  pageSize?: number;
}

export interface ListTasksOutput {
  tasks: TaskDTO[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export class ListTasksUseCase {
  constructor(private taskRepository: TaskRepository) {}

  async execute(input: ListTasksInput): Promise<ListTasksOutput> {
    const page = input.page ?? 1;
    const pageSize = input.pageSize ?? 20;

    // Use findMany with filters
    const result = await this.taskRepository.findMany({
      projectId: input.projectId,
      status: input.status,
      assigneeId: input.assigneeId,
      tags: input.tags,
      page,
      pageSize,
    });

    return {
      tasks: result.tasks.map((task) => taskToDTO(task)),
      totalCount: result.totalCount,
      page,
      pageSize,
    };
  }
}
