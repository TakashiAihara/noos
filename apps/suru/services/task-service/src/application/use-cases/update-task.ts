/**
 * Update Task Use Case
 */

import type { TaskRepository } from '../../domain/repositories/task-repository';
import { TaskId } from '../../domain/value-objects/task-id';
import { type TaskDTO, taskToDTO } from '../mappers/task-mapper';

export interface UpdateTaskInput {
  taskId: string;
  title?: string;
  description?: string;
  status?: string;
  priority?: string;
  dueDate?: Date;
  tags?: string[];
  version: number;
}

export interface UpdateTaskOutput {
  task: TaskDTO;
}

export class UpdateTaskUseCase {
  constructor(private taskRepository: TaskRepository) {}

  async execute(input: UpdateTaskInput): Promise<UpdateTaskOutput> {
    const taskId = TaskId.create(input.taskId);
    const task = await this.taskRepository.findById(taskId);

    if (!task) {
      throw new Error(`Task with id ${input.taskId} not found`);
    }

    // Check version for optimistic locking
    if (task.version !== input.version) {
      throw new Error('Task version conflict - task was modified by another process');
    }

    // Update status separately if provided
    if (input.status !== undefined) {
      task.changeStatus(input.status);
    }

    // Update other details using updateDetails
    task.updateDetails({
      title: input.title,
      description: input.description,
      priority: input.priority,
      dueDate: input.dueDate,
      tags: input.tags,
    });

    await this.taskRepository.save(task);

    return {
      task: taskToDTO(task),
    };
  }
}
