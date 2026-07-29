import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ITaskRepository } from './task.repository.interface';
import { CreateTaskDto, TaskStatus } from '../dto/create-task.dto';
import { UpdateTaskDto } from '../dto/update-task.dto';
import { TaskFilterDto } from '../dto/task-filter.dto';
import { Task } from '../entities/task.entity';
import { PaginationParams, PaginatedResult } from '../../common/interfaces/pagination.interface';
import { handlePrismaError } from '../../common/utils/prisma-error.util';

@Injectable()
export class TaskRepository implements ITaskRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createTask(userId: string, data: CreateTaskDto): Promise<Task> {
    try {
      const task = await this.prisma.task.create({
        data: {
          userId,
          planId: data.planId ?? null,
          title: data.title,
          description: data.description ?? null,
          status: data.status,
          priority: data.priority,
          dueDate: new Date(data.dueDate),
          assignment: data.assignment ?? null,
        },
      });
      return task as unknown as Task;
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async findTaskById(id: string): Promise<Task | null> {
    try {
      const task = await this.prisma.task.findUnique({
        where: { id },
      });
      return task as unknown as Task | null;
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async findTasksByPlan(
    planId: string,
    filters?: TaskFilterDto,
    pagination?: PaginationParams,
  ): Promise<PaginatedResult<Task>> {
    try {
      const where: any = { planId };

      if (filters?.status) {
        where.status = filters.status;
      }
      if (filters?.priority) {
        where.priority = filters.priority;
      }
      if (filters?.dueDateFrom || filters?.dueDateTo) {
        where.dueDate = {};
        if (filters.dueDateFrom) {
          where.dueDate.gte = new Date(filters.dueDateFrom);
        }
        if (filters.dueDateTo) {
          where.dueDate.lte = new Date(filters.dueDateTo);
        }
      }

      const page = pagination?.page ?? 1;
      const limit = pagination?.limit ?? 10;
      const skip = (page - 1) * limit;

      const [data, total] = await this.prisma.$transaction([
        this.prisma.task.findMany({
          where,
          skip,
          take: limit,
          orderBy: { dueDate: 'asc' },
        }),
        this.prisma.task.count({ where }),
      ]);

      return {
        data: data as unknown as Task[],
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async updateTaskStatus(id: string, status: TaskStatus): Promise<Task> {
    try {
      const task = await this.prisma.task.update({
        where: { id },
        data: { status },
      });
      return task as unknown as Task;
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async updateTask(id: string, data: UpdateTaskDto): Promise<Task> {
    try {
      const updateData: any = {};
      if (data.title !== undefined) updateData.title = data.title;
      if (data.description !== undefined) updateData.description = data.description;
      if (data.status !== undefined) updateData.status = data.status;
      if (data.priority !== undefined) updateData.priority = data.priority;
      if (data.dueDate !== undefined) updateData.dueDate = new Date(data.dueDate);
      if (data.assignment !== undefined) updateData.assignment = data.assignment;
      if (data.planId !== undefined) updateData.planId = data.planId;

      const task = await this.prisma.task.update({
        where: { id },
        data: updateData,
      });
      return task as unknown as Task;
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async deleteTask(id: string): Promise<Task> {
    try {
      const task = await this.prisma.task.delete({
        where: { id },
      });
      return task as unknown as Task;
    } catch (error) {
      handlePrismaError(error);
    }
  }
}
