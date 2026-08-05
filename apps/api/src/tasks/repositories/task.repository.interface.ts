import { CreateTaskDto } from "../dto/create-task.dto";
import { UpdateTaskDto } from "../dto/update-task.dto";
import { TaskFilterDto } from "../dto/task-filter.dto";
import { Task } from "../entities/task.entity";
import {
  PaginationParams,
  PaginatedResult,
} from "../../common/interfaces/pagination.interface";

export interface ITaskRepository {
  createTask(missionId: number, data: CreateTaskDto): Promise<Task>;
  findTaskById(id: number): Promise<Task | null>;
  findTasksByMission(
    missionId: number,
    filters?: TaskFilterDto,
    pagination?: PaginationParams,
  ): Promise<PaginatedResult<Task>>;
  updateTaskStatus(id: number, status: string): Promise<Task>;
  updateTask(id: number, data: UpdateTaskDto): Promise<Task>;
  deleteTask(id: number): Promise<Task>;
}
