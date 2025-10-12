/**
 * Task Mapper - Converts Task entity to DTO
 */

import type { Task } from '../../domain/entities/task';

export interface TaskDTO {
  id: string;
  projectId: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  dueDate?: Date;
  tags: string[];
  assigneeId?: string;
  parentTaskId?: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  version: number;
}

export function taskToDTO(task: Task): TaskDTO {
  return {
    id: task.id.toString(),
    projectId: task.projectId,
    title: task.title.toString(),
    description: task.description,
    status: task.status.toString(),
    priority: task.priority.toString(),
    dueDate: task.dueDate,
    tags: task.tags,
    assigneeId: task.assigneeId,
    parentTaskId: task.parentTaskId?.toString(),
    createdBy: task.createdBy,
    createdAt: task.createdAt,
    updatedAt: task.updatedAt,
    version: task.version,
  };
}
