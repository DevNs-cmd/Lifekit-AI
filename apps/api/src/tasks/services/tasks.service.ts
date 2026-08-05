import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from "@nestjs/common";
import { TaskRepository } from "../repositories/task.repository";
import { LifeMissionRepository } from "../../life-mission/repositories/life-mission.repository";
import { CreateTaskDto } from "../dto/create-task.dto";
import { UpdateTaskDto } from "../dto/update-task.dto";
import { TaskFilterDto } from "../dto/task-filter.dto";
import { Task } from "../entities/task.entity";
import {
  PaginationParams,
  PaginatedResult,
} from "../../common/interfaces/pagination.interface";

@Injectable()
export class TasksService {
  constructor(
    private readonly taskRepository: TaskRepository,
    private readonly missionRepository: LifeMissionRepository,
  ) {}

  async create(userId: number, dto: CreateTaskDto): Promise<Task> {
    if (!dto.missionId) {
      throw new NotFoundException("Parent mission ID must be provided");
    }

    const mission = await this.missionRepository.findMissionById(dto.missionId);
    if (!mission) {
      throw new NotFoundException("Associated life mission not found");
    }

    if (mission.user_id !== userId) {
      throw new ForbiddenException(
        "You do not have permission to add tasks to this mission",
      );
    }

    return this.taskRepository.createTask(dto.missionId, dto);
  }

  async findOne(id: number, userId: number): Promise<Task> {
    const task = await this.taskRepository.findTaskById(id);
    if (!task) {
      throw new NotFoundException("Task not found");
    }

    const mission = await this.missionRepository.findMissionById(
      task.mission_id,
    );
    if (!mission || mission.user_id !== userId) {
      throw new ForbiddenException(
        "You do not have permission to access this task",
      );
    }

    return task;
  }

  async findAllByMission(
    userId: number,
    missionId: number,
    filters?: TaskFilterDto,
    pagination?: PaginationParams,
  ): Promise<PaginatedResult<Task>> {
    const mission = await this.missionRepository.findMissionById(missionId);
    if (!mission) {
      throw new NotFoundException("Life mission not found");
    }

    if (mission.user_id !== userId) {
      throw new ForbiddenException(
        "You do not have permission to access tasks for this mission",
      );
    }

    return this.taskRepository.findTasksByMission(
      missionId,
      filters,
      pagination,
    );
  }

  async update(id: number, userId: number, dto: UpdateTaskDto): Promise<Task> {
    await this.findOne(id, userId); // verify ownership
    return this.taskRepository.updateTask(id, dto);
  }

  async updateStatus(
    id: number,
    userId: number,
    status: string,
  ): Promise<Task> {
    await this.findOne(id, userId); // verify ownership
    return this.taskRepository.updateTaskStatus(id, status);
  }

  async remove(id: number, userId: number): Promise<Task> {
    await this.findOne(id, userId); // verify ownership
    return this.taskRepository.deleteTask(id);
  }
}
