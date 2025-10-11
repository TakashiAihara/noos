/**
 * Assign Task Use Case
 */

import type { TaskRepository } from '../../domain/repositories/task-repository';
import { TaskId } from '../../domain/value-objects/task-id';
import { type TaskDTO, taskToDTO } from '../mappers/task-mapper';

export interface AssignTaskInput {
  taskId: string;
  assigneeId?: string;
}

export interface AssignTaskOutput {
  task: TaskDTO;
}

export class AssignTaskUseCase {
  constructor(private taskRepository: TaskRepository) {}

  async execute(input: AssignTaskInput): Promise<AssignTaskOutput> {
    const taskId = TaskId.create(input.taskId);
    const task = await this.taskRepository.findById(taskId);

    if (!task) {
      throw new Error(`Task with id ${input.taskId} not found`);
    }

    // Use assignTo for both assigning and unassigning (pass undefined to unassign)
    task.assignTo(input.assigneeId);

    await this.taskRepository.save(task);

    return {
      task: taskToDTO(task),
    };
  }
}
