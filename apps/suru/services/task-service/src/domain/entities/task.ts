/**
 * Task Entity (Aggregate Root)
 */

import { ValidationError } from '@noos/suru-types';
import { Priority, TaskId, TaskStatus, TaskTitle } from '../value-objects';

export interface TaskProps {
  id: TaskId;
  title: TaskTitle;
  description?: string;
  status: TaskStatus;
  priority: Priority;
  dueDate?: Date;
  projectId: string;
  assigneeId?: string;
  parentTaskId?: TaskId;
  tags: string[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  version: number;
}

export class Task {
  private props: TaskProps;
  private subtasks: Task[] = [];

  private constructor(props: TaskProps) {
    this.props = props;
  }

  /**
   * Create a new task
   */
  static create(params: {
    projectId: string;
    title: string;
    description?: string;
    priority?: string;
    dueDate?: Date;
    tags?: string[];
    assigneeId?: string;
    parentTaskId?: string;
    createdBy: string;
  }): Task {
    const taskId = TaskId.generate();
    const taskTitle = TaskTitle.create(params.title);
    const taskStatus = TaskStatus.TODO();
    const taskPriority = params.priority ? Priority.create(params.priority) : Priority.MEDIUM();

    const now = new Date();

    const task = new Task({
      id: taskId,
      title: taskTitle,
      description: params.description,
      status: taskStatus,
      priority: taskPriority,
      dueDate: params.dueDate,
      projectId: params.projectId,
      assigneeId: params.assigneeId,
      parentTaskId: params.parentTaskId ? TaskId.create(params.parentTaskId) : undefined,
      tags: params.tags || [],
      createdBy: params.createdBy,
      createdAt: now,
      updatedAt: now,
      version: 0,
    });

    // Validate invariants
    task.validate();

    return task;
  }

  /**
   * Reconstruct task from persistence
   */
  static reconstitute(props: TaskProps): Task {
    return new Task(props);
  }

  /**
   * Update task details
   */
  updateDetails(params: {
    title?: string;
    description?: string;
    priority?: string;
    dueDate?: Date;
    tags?: string[];
  }): void {
    if (params.title) {
      this.props.title = TaskTitle.create(params.title);
    }
    if (params.description !== undefined) {
      this.props.description = params.description;
    }
    if (params.priority) {
      this.props.priority = Priority.create(params.priority);
    }
    if (params.dueDate !== undefined) {
      this.props.dueDate = params.dueDate;
    }
    if (params.tags) {
      this.props.tags = params.tags;
    }

    this.props.updatedAt = new Date();
    this.props.version++;
  }

  /**
   * Change task status
   */
  changeStatus(newStatus: string): void {
    const status = TaskStatus.create(newStatus);

    if (!this.props.status.canTransitionTo(status)) {
      throw new ValidationError(`Cannot transition from ${this.props.status} to ${status}`);
    }

    this.props.status = status;
    this.props.updatedAt = new Date();
    this.props.version++;
  }

  /**
   * Assign task to user
   */
  assignTo(userId: string | undefined): void {
    this.props.assigneeId = userId;
    this.props.updatedAt = new Date();
    this.props.version++;
  }

  /**
   * Add subtask
   */
  addSubtask(subtask: Task): void {
    // Ensure subtask hierarchy is max 1 level deep
    if (this.props.parentTaskId) {
      throw new ValidationError('Cannot add subtask to a subtask (max 1 level)');
    }
    if (subtask.props.parentTaskId?.toString() !== this.props.id.toString()) {
      throw new ValidationError('Subtask parent mismatch');
    }

    this.subtasks.push(subtask);
    this.props.updatedAt = new Date();
    this.props.version++;
  }

  /**
   * Validate domain invariants
   */
  private validate(): void {
    // Subtasks cannot have subtasks
    if (this.props.parentTaskId && this.subtasks.length > 0) {
      throw new ValidationError('Subtasks cannot have subtasks (max 1 level deep)');
    }
  }

  // Getters
  get id(): TaskId {
    return this.props.id;
  }

  get title(): TaskTitle {
    return this.props.title;
  }

  get description(): string | undefined {
    return this.props.description;
  }

  get status(): TaskStatus {
    return this.props.status;
  }

  get priority(): Priority {
    return this.props.priority;
  }

  get dueDate(): Date | undefined {
    return this.props.dueDate;
  }

  get projectId(): string {
    return this.props.projectId;
  }

  get assigneeId(): string | undefined {
    return this.props.assigneeId;
  }

  get parentTaskId(): TaskId | undefined {
    return this.props.parentTaskId;
  }

  get tags(): string[] {
    return [...this.props.tags];
  }

  get createdBy(): string {
    return this.props.createdBy;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  get version(): number {
    return this.props.version;
  }

  getSubtasks(): Task[] {
    return [...this.subtasks];
  }

  /**
   * Convert to plain object for persistence
   */
  toObject() {
    return {
      id: this.props.id.toString(),
      title: this.props.title.toString(),
      description: this.props.description,
      status: this.props.status.toString(),
      priority: this.props.priority.toString(),
      dueDate: this.props.dueDate,
      projectId: this.props.projectId,
      assigneeId: this.props.assigneeId,
      parentTaskId: this.props.parentTaskId?.toString(),
      tags: this.props.tags,
      createdBy: this.props.createdBy,
      createdAt: this.props.createdAt,
      updatedAt: this.props.updatedAt,
      version: this.props.version,
    };
  }
}
