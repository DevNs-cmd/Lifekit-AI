import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { ILifeMissionRepository } from "./life-mission.repository.interface";
import { CreateLifeMissionDto } from "../dto/create-life-mission.dto";
import { UpdateLifeMissionDto } from "../dto/update-life-mission.dto";
import { LifeMission } from "../entities/life-mission.entity";
import { PriorityLevel, MissionStatus } from "../../common/enums";
import {
  PaginationParams,
  PaginatedResult,
} from "../../common/interfaces/pagination.interface";
import { handlePrismaError } from "../../common/utils/prisma-error.util";

@Injectable()
export class LifeMissionRepository implements ILifeMissionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createMission(
    userId: number,
    data: CreateLifeMissionDto,
  ): Promise<LifeMission> {
    try {
      // Serialize array fields into description to prevent data loss
      const serializedDescription = JSON.stringify({
        text: data.description,
        goals: data.goals,
        values: data.values,
        longTermObjectives: data.longTermObjectives,
        constraints: data.constraints ?? [],
      });

      const mission = await this.prisma.missions.create({
        data: {
          user_id: userId,
          title: data.title,
          description: serializedDescription,
          category: data.category ?? null,
          priority: PriorityLevel.MEDIUM,
          status: MissionStatus.ACTIVE,
          start_date: data.startDate ? new Date(data.startDate) : new Date(),
          target_date: data.targetDate ? new Date(data.targetDate) : null,
          progress: 0,
        },
      });

      return mapPrismaMissionToEntity(mission);
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async findMissionById(id: number): Promise<LifeMission | null> {
    try {
      const mission = await this.prisma.missions.findUnique({
        where: { mission_id: id },
      });
      if (!mission) return null;
      return mapPrismaMissionToEntity(mission);
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async findUserMissions(
    userId: number,
    filters?: {
      status?: string;
      startDate?: Date;
      targetDate?: Date;
      category?: string;
      priority?: string;
    },
    pagination?: PaginationParams,
  ): Promise<PaginatedResult<LifeMission>> {
    try {
      const where: any = { user_id: userId };

      if (filters?.status) {
        where.status = filters.status.toUpperCase() as MissionStatus;
      }
      if (filters?.category) {
        where.category = filters.category;
      }
      if (filters?.priority) {
        where.priority = filters.priority.toUpperCase() as PriorityLevel;
      }

      if (filters?.startDate) {
        where.start_date = {
          gte: filters.startDate,
        };
      }

      if (filters?.targetDate) {
        where.target_date = {
          lte: filters.targetDate,
        };
      }

      const page = pagination?.page ?? 1;
      const limit = Math.min(pagination?.limit ?? 10, 100);
      const skip = (page - 1) * limit;

      const [data, total] = await this.prisma.$transaction([
        this.prisma.missions.findMany({
          where,
          skip,
          take: limit,
          orderBy: { created_at: "desc" },
        }),
        this.prisma.missions.count({ where }),
      ]);

      return {
        data: data.map((m) => mapPrismaMissionToEntity(m)),
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
    id: number,
    data: UpdateLifeMissionDto,
  ): Promise<LifeMission> {
    try {
      const existing = await this.prisma.missions.findUnique({
        where: { mission_id: id },
      });

      if (!existing) {
        throw new Error("Mission not found");
      }

      // If we have arrays or description to update, merge with existing serialized JSON
      let text = data.description;
      let goals = data.goals;
      let values = data.values;
      let longTermObjectives = data.longTermObjectives;
      let constraints = data.constraints;

      try {
        const parsed = JSON.parse(existing.description || "{}");
        if (text === undefined) text = parsed.text;
        if (goals === undefined) goals = parsed.goals;
        if (values === undefined) values = parsed.values;
        if (longTermObjectives === undefined)
          longTermObjectives = parsed.longTermObjectives;
        if (constraints === undefined) constraints = parsed.constraints;
      } catch {
        // existing description was not JSON
      }

      const serializedDescription = JSON.stringify({
        text: text ?? existing.description,
        goals: goals ?? [],
        values: values ?? [],
        longTermObjectives: longTermObjectives ?? [],
        constraints: constraints ?? [],
      });

      const updatePayload: any = {
        title: data.title,
        description: serializedDescription,
        start_date: data.startDate ? new Date(data.startDate) : undefined,
        target_date: data.targetDate ? new Date(data.targetDate) : undefined,
      };

      if (data.category !== undefined) {
        updatePayload.category = data.category;
      }

      const updated = await this.prisma.missions.update({
        where: { mission_id: id },
        data: updatePayload,
      });

      return mapPrismaMissionToEntity(updated);
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async deleteMission(id: number): Promise<LifeMission> {
    try {
      const mission = await this.prisma.missions.findUnique({
        where: { mission_id: id },
      });
      if (mission) {
        await this.prisma.missions.delete({
          where: { mission_id: id },
        });
      }
      return mapPrismaMissionToEntity(mission!)!;
    } catch (error) {
      handlePrismaError(error);
    }
  }
}

function mapPrismaMissionToEntity(m: any): LifeMission {
  if (!m) return null as any;

  let text = m.description;
  let goals: string[] = [];
  let values: string[] = [];
  let longTermObjectives: string[] = [];
  let constraints: string[] = [];

  try {
    const parsed = JSON.parse(m.description || "{}");
    text = parsed.text ?? m.description;
    goals = parsed.goals ?? [];
    values = parsed.values ?? [];
    longTermObjectives = parsed.longTermObjectives ?? [];
    constraints = parsed.constraints ?? [];
  } catch {
    // raw string
  }

  return {
    mission_id: m.mission_id,
    user_id: m.user_id,
    title: m.title,
    description: text,
    category: m.category,
    priority: m.priority as PriorityLevel,
    status: m.status as MissionStatus,
    progress: m.progress,
    isArchived: m.isArchived,
    archivedAt: m.archivedAt,
    start_date: m.start_date,
    target_date: m.target_date,
    created_at: m.created_at,
    updated_at: m.updated_at,
    goals,
    values,
    longTermObjectives,
    constraints,
    id: m.mission_id,
    userId: m.user_id,
    startDate: m.start_date,
    targetDate: m.target_date,
  } as unknown as LifeMission;
}
