/**
 * Task Repository Interface (Port)
 */

import { Task } from '../entities/task';
import { TaskId } from '../value-objects/task-id';

export interface TaskFilters {
  projectId: string;
  status?: string;
  assigneeId?: string;
  tags?: string[];
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}

export interface TaskRepository {
  /**
   * Save a task (create or update)
   */
  save(task: Task): Promise<void>;

  /**
   * Find task by ID
   */
  findById(id: TaskId, includeSubtasks?: boolean): Promise<Task | null>;

  /**
   * Find tasks with filters and pagination
   */
  findMany(filters: TaskFilters): Promise<{
    tasks: Task[];
    totalCount: number;
  }>;

  /**
   * Delete a task
   */
  delete(id: TaskId): Promise<void>;

  /**
   * Check if task exists
   */
  exists(id: TaskId): Promise<boolean>;
}
