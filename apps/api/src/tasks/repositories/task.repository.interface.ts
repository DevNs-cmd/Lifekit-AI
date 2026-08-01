import { CreateTaskDto, TaskStatus } from "../dto/create-task.dto";
import { UpdateTaskDto } from "../dto/update-task.dto";
import { TaskFilterDto } from "../dto/task-filter.dto";
import { Task } from "../entities/task.entity";
import {
  PaginationParams,
  PaginatedResult,
} from "../../common/interfaces/pagination.interface";

export interface ITaskRepository {
  createTask(userId: string, data: CreateTaskDto): Promise<Task>;
  findTaskById(id: string): Promise<Task | null>;
  findTasksByPlan(
    planId: string,
    filters?: TaskFilterDto,
    pagination?: PaginationParams,
  ): Promise<PaginatedResult<Task>>;
  updateTaskStatus(id: string, status: TaskStatus): Promise<Task>;
  updateTask(id: string, data: UpdateTaskDto): Promise<Task>;
  deleteTask(id: string): Promise<Task>;
}
