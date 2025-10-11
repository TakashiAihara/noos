/**
 * Create Task Use Case
 */

import { Task } from '../../domain/entities/task';
import type { TaskRepository } from '../../domain/repositories/task-repository';

export interface CreateTaskInput {
  projectId: string;
  title: string;
  description?: string;
  priority?: string;
  dueDate?: Date;
  tags?: string[];
  assigneeId?: string;
  parentTaskId?: string;
  createdBy: string;
}

export interface CreateTaskOutput {
  taskId: string;
}

export class CreateTaskUseCase {
  constructor(private taskRepository: TaskRepository) {}

  async execute(input: CreateTaskInput): Promise<CreateTaskOutput> {
    const task = Task.create({
      projectId: input.projectId,
      title: input.title,
      description: input.description,
      priority: input.priority ?? 'MEDIUM',
      dueDate: input.dueDate,
      tags: input.tags ?? [],
      assigneeId: input.assigneeId,
      parentTaskId: input.parentTaskId,
      createdBy: input.createdBy,
    });

    await this.taskRepository.save(task);

    return { taskId: task.id.toString() };
  }
}
