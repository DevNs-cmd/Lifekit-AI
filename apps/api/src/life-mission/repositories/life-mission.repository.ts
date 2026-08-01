import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { ILifeMissionRepository } from "./life-mission.repository.interface";
import { CreateLifeMissionDto } from "../dto/create-life-mission.dto";
import { UpdateLifeMissionDto } from "../dto/update-life-mission.dto";
import { LifeMission } from "../entities/life-mission.entity";
import {
  PaginationParams,
  PaginatedResult,
} from "../../common/interfaces/pagination.interface";
import { handlePrismaError } from "../../common/utils/prisma-error.util";

@Injectable()
export class LifeMissionRepository implements ILifeMissionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createMission(
    userId: string,
    data: CreateLifeMissionDto,
  ): Promise<LifeMission> {
    try {
      return await this.prisma.lifeMission.create({
        data: {
          userId,
          title: data.title,
          description: data.description,
          goals: data.goals,
          values: data.values,
          longTermObjectives: data.longTermObjectives,
          constraints: data.constraints ?? [],
          startDate: new Date(data.startDate),
          targetDate: new Date(data.targetDate),
        },
      });
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async findMissionById(id: string): Promise<LifeMission | null> {
    try {
      return await this.prisma.lifeMission.findUnique({
        where: { id },
      });
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async findUserMissions(
    userId: string,
    filters?: { status?: string; startDate?: Date; targetDate?: Date },
    pagination?: PaginationParams,
  ): Promise<PaginatedResult<LifeMission>> {
    try {
      const where: any = { userId };
      const now = new Date();

      if (filters?.status) {
        const statusUpper = filters.status.toUpperCase();
        if (statusUpper === "PENDING") {
          where.startDate = { gt: now };
        } else if (statusUpper === "ACTIVE") {
          where.startDate = { lte: now };
          where.targetDate = { gte: now };
        } else if (statusUpper === "COMPLETED" || statusUpper === "EXPIRED") {
          where.targetDate = { lt: now };
        }
      }

      if (filters?.startDate) {
        where.startDate = {
          ...where.startDate,
          gte: filters.startDate,
        };
      }

      if (filters?.targetDate) {
        where.targetDate = {
          ...where.targetDate,
          lte: filters.targetDate,
        };
      }

      const page = pagination?.page ?? 1;
      const limit = pagination?.limit ?? 10;
      const skip = (page - 1) * limit;

      const [data, total] = await this.prisma.$transaction([
        this.prisma.lifeMission.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: "desc" },
        }),
        this.prisma.lifeMission.count({ where }),
      ]);

      return {
        data,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async updateMission(
    id: string,
    data: UpdateLifeMissionDto,
  ): Promise<LifeMission> {
    try {
      const updateData: any = {};
      if (data.title !== undefined) updateData.title = data.title;
      if (data.description !== undefined)
        updateData.description = data.description;
      if (data.goals !== undefined) updateData.goals = data.goals;
      if (data.values !== undefined) updateData.values = data.values;
      if (data.longTermObjectives !== undefined)
        updateData.longTermObjectives = data.longTermObjectives;
      if (data.constraints !== undefined)
        updateData.constraints = data.constraints;
      if (data.startDate !== undefined)
        updateData.startDate = new Date(data.startDate);
      if (data.targetDate !== undefined)
        updateData.targetDate = new Date(data.targetDate);

      return await this.prisma.lifeMission.update({
        where: { id },
        data: updateData,
      });
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async deleteMission(id: string): Promise<LifeMission> {
    try {
      return await this.prisma.lifeMission.delete({
        where: { id },
      });
    } catch (error) {
      handlePrismaError(error);
    }
  }
}
