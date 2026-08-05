import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { ITaskRepository } from "./task.repository.interface";
import { CreateTaskDto, TaskStatus } from "../dto/create-task.dto";
import { UpdateTaskDto } from "../dto/update-task.dto";
import { TaskFilterDto } from "../dto/task-filter.dto";
import { Task } from "../entities/task.entity";
import {
  PaginationParams,
  PaginatedResult,
} from "../../common/interfaces/pagination.interface";
import { handlePrismaError } from "../../common/utils/prisma-error.util";

@Injectable()
export class TaskRepository implements ITaskRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createTask(missionId: number, data: CreateTaskDto): Promise<Task> {
    try {
      const isCompleted = data.status === TaskStatus.COMPLETED;
      const task = await this.prisma.tasks.create({
        data: {
          mission_id: missionId,
          title: data.title,
          description: data.description ?? null,
          status: data.status,
          priority: data.priority,
          due_date: data.dueDate ? new Date(data.dueDate) : null,
          completed_at: isCompleted ? new Date() : null,
        },
      });
      return mapPrismaTaskToEntity(task);
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async findTaskById(id: number): Promise<Task | null> {
    try {
      const task = await this.prisma.tasks.findUnique({
        where: { task_id: id },
      });
      if (!task) return null;
      return mapPrismaTaskToEntity(task);
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async findTasksByMission(
    missionId: number,
    filters?: TaskFilterDto,
    pagination?: PaginationParams,
  ): Promise<PaginatedResult<Task>> {
    try {
      const where: any = { mission_id: missionId };

      if (filters?.status) {
        where.status = filters.status;
      }
      if (filters?.priority) {
        where.priority = filters.priority;
      }
      if (filters?.dueDateFrom || filters?.dueDateTo) {
        where.due_date = {};
        if (filters.dueDateFrom) {
          where.due_date.gte = new Date(filters.dueDateFrom);
        }
        if (filters.dueDateTo) {
          where.due_date.lte = new Date(filters.dueDateTo);
        }
      }

      const page = pagination?.page ?? 1;
      const limit = Math.min(pagination?.limit ?? 10, 100);
      const skip = (page - 1) * limit;

      const [data, total] = await this.prisma.$transaction([
        this.prisma.tasks.findMany({
          where,
          skip,
          take: limit,
          orderBy: { due_date: "asc" },
        }),
        this.prisma.tasks.count({ where }),
      ]);

      return {
        data: data.map((t) => mapPrismaTaskToEntity(t)),
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async updateTaskStatus(id: number, status: string): Promise<Task> {
    try {
      const isCompleted = status.toUpperCase() === "COMPLETED";
      const task = await this.prisma.tasks.update({
        where: { task_id: id },
        data: {
          status,
          completed_at: isCompleted ? new Date() : null,
        },
      });
      return mapPrismaTaskToEntity(task);
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async updateTask(id: number, data: UpdateTaskDto): Promise<Task> {
    try {
      const updateData: any = {};
      if (data.title !== undefined) updateData.title = data.title;
      if (data.description !== undefined)
        updateData.description = data.description;
      if (data.status !== undefined) {
        updateData.status = data.status;
        if (data.status === TaskStatus.COMPLETED) {
          updateData.completed_at = new Date();
        } else {
          updateData.completed_at = null;
        }
      }
      if (data.priority !== undefined) updateData.priority = data.priority;
      if (data.dueDate !== undefined)
        updateData.due_date = data.dueDate ? new Date(data.dueDate) : null;

      const task = await this.prisma.tasks.update({
        where: { task_id: id },
        data: updateData,
      });
      return mapPrismaTaskToEntity(task);
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async deleteTask(id: number): Promise<Task> {
    try {
      const task = await this.prisma.tasks.findUnique({
        where: { task_id: id },
      });
      if (task) {
        await this.prisma.tasks.delete({
          where: { task_id: id },
        });
      }
      return mapPrismaTaskToEntity(task!)!;
    } catch (error) {
      handlePrismaError(error);
    }
  }
}

function mapPrismaTaskToEntity(t: any): Task {
  if (!t) return null as any;
  return {
    task_id: t.task_id,
    mission_id: t.mission_id,
    title: t.title,
    description: t.description,
    status: t.status,
    priority: t.priority,
    due_date: t.due_date,
    estimated_time: t.estimated_time,
    completed_at: t.completed_at,
    created_at: t.created_at,
  } as unknown as Task;
}
