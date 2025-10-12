/**
 * Task Service gRPC Server Implementation
 */

import { create } from '@bufbuild/protobuf';
import type { ConnectRouter } from '@connectrpc/connect';
import { Code, ConnectError } from '@connectrpc/connect';
import { TaskService } from '@noos/suru-proto/dist/task-service_connect';
import {
  type AddSubtaskRequest,
  type AddSubtaskResponse,
  AddSubtaskResponseSchema,
  type AssignTaskRequest,
  type AssignTaskResponse,
  AssignTaskResponseSchema,
  type CreateTaskRequest,
  type CreateTaskResponse,
  CreateTaskResponseSchema,
  type DeleteTaskRequest,
  type DeleteTaskResponse,
  DeleteTaskResponseSchema,
  type GetTaskRequest,
  type GetTaskResponse,
  GetTaskResponseSchema,
  type ListTasksRequest,
  type ListTasksResponse,
  ListTasksResponseSchema,
  Priority,
  type TaskEvent,
  TaskSchema,
  TaskStatus,
  type UpdateTaskRequest,
  type UpdateTaskResponse,
  UpdateTaskResponseSchema,
  type WatchTasksRequest,
} from '@noos/suru-proto/dist/task-service_pb';

import { AddSubtaskUseCase } from '../../application/use-cases/add-subtask';
import { AssignTaskUseCase } from '../../application/use-cases/assign-task';
import { CreateTaskUseCase } from '../../application/use-cases/create-task';
import { DeleteTaskUseCase } from '../../application/use-cases/delete-task';
import { GetTaskUseCase } from '../../application/use-cases/get-task';
import { ListTasksUseCase } from '../../application/use-cases/list-tasks';
import { UpdateTaskUseCase } from '../../application/use-cases/update-task';
import type { TaskRepository } from '../../domain/repositories/task-repository';

export class TaskServiceHandler {
  private createTaskUseCase: CreateTaskUseCase;
  private getTaskUseCase: GetTaskUseCase;
  private listTasksUseCase: ListTasksUseCase;
  private updateTaskUseCase: UpdateTaskUseCase;
  private deleteTaskUseCase: DeleteTaskUseCase;
  private assignTaskUseCase: AssignTaskUseCase;
  private addSubtaskUseCase: AddSubtaskUseCase;

  constructor(taskRepository: TaskRepository) {
    this.createTaskUseCase = new CreateTaskUseCase(taskRepository);
    this.getTaskUseCase = new GetTaskUseCase(taskRepository);
    this.listTasksUseCase = new ListTasksUseCase(taskRepository);
    this.updateTaskUseCase = new UpdateTaskUseCase(taskRepository);
    this.deleteTaskUseCase = new DeleteTaskUseCase(taskRepository);
    this.assignTaskUseCase = new AssignTaskUseCase(taskRepository);
    this.addSubtaskUseCase = new AddSubtaskUseCase(taskRepository);
  }

  registerRoutes(router: ConnectRouter): void {
    router.service(TaskService, {
      createTask: async (req: CreateTaskRequest): Promise<CreateTaskResponse> => {
        try {
          // Extract createdBy from request metadata (would come from auth context)
          const createdBy = 'system'; // TODO: Get from auth context

          const result = await this.createTaskUseCase.execute({
            projectId: req.projectId,
            title: req.title,
            description: req.description,
            priority: req.priority ? this.mapPriorityFromProto(req.priority) : undefined,
            dueDate: req.dueDate ? new Date(req.dueDate) : undefined,
            tags: req.tags,
            assigneeId: req.assigneeId,
            parentTaskId: req.parentTaskId,
            createdBy,
          });

          // Get the created task to return full details
          const task = await this.getTaskUseCase.execute({ taskId: result.taskId });

          return create(CreateTaskResponseSchema, {
            task: create(TaskSchema, {
              id: task.task.id,
              title: task.task.title,
              description: task.task.description,
              status: this.mapStatusToProto(task.task.status),
              priority: this.mapPriorityToProto(task.task.priority),
              dueDate: task.task.dueDate?.toISOString(),
              projectId: task.task.projectId,
              assigneeId: task.task.assigneeId,
              tags: task.task.tags,
              parentTaskId: task.task.parentTaskId,
              subtasks: [],
              createdBy: task.task.createdBy,
              createdAt: task.task.createdAt.toISOString(),
              updatedAt: task.task.updatedAt.toISOString(),
              version: task.task.version,
            }),
          });
        } catch (error) {
          throw new ConnectError(
            error instanceof Error ? error.message : 'Failed to create task',
            Code.Internal,
          );
        }
      },

      getTask: async (req: GetTaskRequest): Promise<GetTaskResponse> => {
        try {
          const result = await this.getTaskUseCase.execute({ taskId: req.id });

          return create(GetTaskResponseSchema, {
            task: create(TaskSchema, {
              id: result.task.id,
              title: result.task.title,
              description: result.task.description,
              status: this.mapStatusToProto(result.task.status),
              priority: this.mapPriorityToProto(result.task.priority),
              dueDate: result.task.dueDate?.toISOString(),
              projectId: result.task.projectId,
              assigneeId: result.task.assigneeId,
              tags: result.task.tags,
              parentTaskId: result.task.parentTaskId,
              subtasks: [],
              createdBy: result.task.createdBy,
              createdAt: result.task.createdAt.toISOString(),
              updatedAt: result.task.updatedAt.toISOString(),
              version: result.task.version,
            }),
          });
        } catch (error) {
          if (error instanceof Error && error.message.includes('not found')) {
            throw new ConnectError(error.message, Code.NotFound);
          }
          throw new ConnectError(
            error instanceof Error ? error.message : 'Failed to get task',
            Code.Internal,
          );
        }
      },

      listTasks: async (req: ListTasksRequest): Promise<ListTasksResponse> => {
        try {
          const result = await this.listTasksUseCase.execute({
            projectId: req.projectId,
            status: req.status ? this.mapStatusFromProto(req.status) : undefined,
            assigneeId: req.assigneeId,
            tags: req.tags,
            page: req.page || 1,
            pageSize: req.pageSize || 20,
          });

          return create(ListTasksResponseSchema, {
            tasks: result.tasks.map((task) =>
              create(TaskSchema, {
                id: task.id,
                title: task.title,
                description: task.description,
                status: this.mapStatusToProto(task.status),
                priority: this.mapPriorityToProto(task.priority),
                dueDate: task.dueDate?.toISOString(),
                projectId: task.projectId,
                assigneeId: task.assigneeId,
                tags: task.tags,
                parentTaskId: task.parentTaskId,
                subtasks: [],
                createdBy: task.createdBy,
                createdAt: task.createdAt.toISOString(),
                updatedAt: task.updatedAt.toISOString(),
                version: task.version,
              }),
            ),
            totalCount: result.totalCount,
            page: result.page,
            pageSize: result.pageSize,
          });
        } catch (error) {
          throw new ConnectError(
            error instanceof Error ? error.message : 'Failed to list tasks',
            Code.Internal,
          );
        }
      },

      updateTask: async (req: UpdateTaskRequest): Promise<UpdateTaskResponse> => {
        try {
          const result = await this.updateTaskUseCase.execute({
            taskId: req.id,
            title: req.title,
            description: req.description,
            status: req.status ? this.mapStatusFromProto(req.status) : undefined,
            priority: req.priority ? this.mapPriorityFromProto(req.priority) : undefined,
            dueDate: req.dueDate ? new Date(req.dueDate) : undefined,
            tags: req.tags,
            version: req.version,
          });

          return create(UpdateTaskResponseSchema, {
            task: create(TaskSchema, {
              id: result.task.id,
              title: result.task.title,
              description: result.task.description,
              status: this.mapStatusToProto(result.task.status),
              priority: this.mapPriorityToProto(result.task.priority),
              dueDate: result.task.dueDate?.toISOString(),
              projectId: result.task.projectId,
              assigneeId: result.task.assigneeId,
              tags: result.task.tags,
              parentTaskId: result.task.parentTaskId,
              subtasks: [],
              createdBy: result.task.createdBy,
              createdAt: result.task.createdAt.toISOString(),
              updatedAt: result.task.updatedAt.toISOString(),
              version: result.task.version,
            }),
          });
        } catch (error) {
          if (error instanceof Error && error.message.includes('version conflict')) {
            throw new ConnectError(error.message, Code.Aborted);
          }
          if (error instanceof Error && error.message.includes('not found')) {
            throw new ConnectError(error.message, Code.NotFound);
          }
          throw new ConnectError(
            error instanceof Error ? error.message : 'Failed to update task',
            Code.Internal,
          );
        }
      },

      deleteTask: async (req: DeleteTaskRequest): Promise<DeleteTaskResponse> => {
        try {
          const result = await this.deleteTaskUseCase.execute({ taskId: req.id });

          return create(DeleteTaskResponseSchema, {
            success: result.success,
          });
        } catch (error) {
          if (error instanceof Error && error.message.includes('not found')) {
            throw new ConnectError(error.message, Code.NotFound);
          }
          throw new ConnectError(
            error instanceof Error ? error.message : 'Failed to delete task',
            Code.Internal,
          );
        }
      },

      assignTask: async (req: AssignTaskRequest): Promise<AssignTaskResponse> => {
        try {
          const result = await this.assignTaskUseCase.execute({
            taskId: req.taskId,
            assigneeId: req.assigneeId,
          });

          return create(AssignTaskResponseSchema, {
            task: create(TaskSchema, {
              id: result.task.id,
              title: result.task.title,
              description: result.task.description,
              status: this.mapStatusToProto(result.task.status),
              priority: this.mapPriorityToProto(result.task.priority),
              dueDate: result.task.dueDate?.toISOString(),
              projectId: result.task.projectId,
              assigneeId: result.task.assigneeId,
              tags: result.task.tags,
              parentTaskId: result.task.parentTaskId,
              subtasks: [],
              createdBy: result.task.createdBy,
              createdAt: result.task.createdAt.toISOString(),
              updatedAt: result.task.updatedAt.toISOString(),
              version: result.task.version,
            }),
          });
        } catch (error) {
          if (error instanceof Error && error.message.includes('not found')) {
            throw new ConnectError(error.message, Code.NotFound);
          }
          throw new ConnectError(
            error instanceof Error ? error.message : 'Failed to assign task',
            Code.Internal,
          );
        }
      },

      addSubtask: async (req: AddSubtaskRequest): Promise<AddSubtaskResponse> => {
        try {
          // Extract createdBy from request metadata (would come from auth context)
          const createdBy = 'system'; // TODO: Get from auth context

          const result = await this.addSubtaskUseCase.execute({
            parentTaskId: req.parentTaskId,
            title: req.title,
            description: req.description,
            createdBy,
          });

          return create(AddSubtaskResponseSchema, {
            subtask: create(TaskSchema, {
              id: result.subtask.id,
              title: result.subtask.title,
              description: result.subtask.description,
              status: this.mapStatusToProto(result.subtask.status),
              priority: this.mapPriorityToProto(result.subtask.priority),
              dueDate: result.subtask.dueDate?.toISOString(),
              projectId: result.subtask.projectId,
              assigneeId: result.subtask.assigneeId,
              tags: result.subtask.tags,
              parentTaskId: result.subtask.parentTaskId,
              subtasks: [],
              createdBy: result.subtask.createdBy,
              createdAt: result.subtask.createdAt.toISOString(),
              updatedAt: result.subtask.updatedAt.toISOString(),
              version: result.subtask.version,
            }),
          });
        } catch (error) {
          if (error instanceof Error && error.message.includes('not found')) {
            throw new ConnectError(error.message, Code.NotFound);
          }
          throw new ConnectError(
            error instanceof Error ? error.message : 'Failed to add subtask',
            Code.Internal,
          );
        }
      },

      watchTasks: async (req: WatchTasksRequest) => {
        // TODO: Implement real-time streaming with WebSocket or SSE
        throw new ConnectError('Not implemented yet', Code.Unimplemented);
      },
    });
  }

  private mapStatusToProto(status: string): TaskStatus {
    switch (status) {
      case 'TODO':
        return TaskStatus.TODO;
      case 'IN_PROGRESS':
        return TaskStatus.IN_PROGRESS;
      case 'DONE':
        return TaskStatus.DONE;
      default:
        return TaskStatus.TODO;
    }
  }

  private mapStatusFromProto(status: TaskStatus): string {
    switch (status) {
      case TaskStatus.TODO:
        return 'TODO';
      case TaskStatus.IN_PROGRESS:
        return 'IN_PROGRESS';
      case TaskStatus.DONE:
        return 'DONE';
      default:
        return 'TODO';
    }
  }

  private mapPriorityToProto(priority: string): Priority {
    switch (priority) {
      case 'LOW':
        return Priority.LOW;
      case 'MEDIUM':
        return Priority.MEDIUM;
      case 'HIGH':
        return Priority.HIGH;
      default:
        return Priority.MEDIUM;
    }
  }

  private mapPriorityFromProto(priority: Priority): string {
    switch (priority) {
      case Priority.LOW:
        return 'LOW';
      case Priority.MEDIUM:
        return 'MEDIUM';
      case Priority.HIGH:
        return 'HIGH';
      default:
        return 'MEDIUM';
    }
  }
}
