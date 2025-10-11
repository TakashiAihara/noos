/**
 * Get Task Use Case
 */

import type { TaskRepository } from '../../domain/repositories/task-repository';
import { TaskId } from '../../domain/value-objects/task-id';
import { type TaskDTO, taskToDTO } from '../mappers/task-mapper';

export interface GetTaskInput {
  taskId: string;
}

export interface GetTaskOutput {
  task: TaskDTO;
}

export class GetTaskUseCase {
  constructor(private taskRepository: TaskRepository) {}

  async execute(input: GetTaskInput): Promise<GetTaskOutput> {
    const taskId = TaskId.create(input.taskId);
    const task = await this.taskRepository.findById(taskId);

    if (!task) {
      throw new Error(`Task with id ${input.taskId} not found`);
    }

    return {
      task: taskToDTO(task),
    };
  }
}
