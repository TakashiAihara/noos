/**
 * Delete Task Use Case
 */

import type { TaskRepository } from '../../domain/repositories/task-repository';
import { TaskId } from '../../domain/value-objects/task-id';

export interface DeleteTaskInput {
  taskId: string;
}

export interface DeleteTaskOutput {
  success: boolean;
}

export class DeleteTaskUseCase {
  constructor(private taskRepository: TaskRepository) {}

  async execute(input: DeleteTaskInput): Promise<DeleteTaskOutput> {
    const taskId = TaskId.create(input.taskId);
    const task = await this.taskRepository.findById(taskId);

    if (!task) {
      throw new Error(`Task with id ${input.taskId} not found`);
    }

    await this.taskRepository.delete(taskId);

    return { success: true };
  }
}
