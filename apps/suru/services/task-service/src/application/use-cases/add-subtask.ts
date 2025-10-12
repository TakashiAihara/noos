/**
 * Add Subtask Use Case
 */

import { Task } from '../../domain/entities/task';
import type { TaskRepository } from '../../domain/repositories/task-repository';
import { TaskId } from '../../domain/value-objects/task-id';
import { type TaskDTO, taskToDTO } from '../mappers/task-mapper';

export interface AddSubtaskInput {
  parentTaskId: string;
  title: string;
  description?: string;
  createdBy: string;
}

export interface AddSubtaskOutput {
  subtask: TaskDTO;
}

export class AddSubtaskUseCase {
  constructor(private taskRepository: TaskRepository) {}

  async execute(input: AddSubtaskInput): Promise<AddSubtaskOutput> {
    const parentTaskId = TaskId.create(input.parentTaskId);
    const parentTask = await this.taskRepository.findById(parentTaskId);

    if (!parentTask) {
      throw new Error(`Parent task with id ${input.parentTaskId} not found`);
    }

    // Create subtask with same project as parent
    const subtask = Task.create({
      projectId: parentTask.projectId,
      title: input.title,
      description: input.description,
      priority: 'MEDIUM',
      tags: [],
      parentTaskId: input.parentTaskId,
      createdBy: input.createdBy,
    });

    await this.taskRepository.save(subtask);

    return {
      subtask: taskToDTO(subtask),
    };
  }
}
