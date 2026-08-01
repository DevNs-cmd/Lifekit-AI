import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { IPlannerRepository } from "./planner.repository.interface";
import { CreatePlanDto } from "../dto/create-plan.dto";
import { UpdatePlanDto } from "../dto/update-plan.dto";
import { Plan } from "../entities/plan.entity";
import {
  PaginationParams,
  PaginatedResult,
} from "../../common/interfaces/pagination.interface";
import { handlePrismaError } from "../../common/utils/prisma-error.util";

@Injectable()
export class PlannerRepository implements IPlannerRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createPlan(userId: string, data: CreatePlanDto): Promise<Plan> {
    try {
      const plan = await this.prisma.plan.create({
        data: {
          userId,
          missionId: data.missionId ?? null,
          title: data.title,
          goalInput: data.goalInput,
          planningHorizon: data.planningHorizon,
          priority: data.priority,
          constraints: data.constraints ?? [],
          desiredOutcomes: data.desiredOutcomes,
        },
      });
      return plan as unknown as Plan;
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async findPlanById(id: string): Promise<Plan | null> {
    try {
      const plan = await this.prisma.plan.findUnique({
        where: { id },
      });
      return plan as unknown as Plan | null;
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async findPlansByMission(
    missionId: string,
    pagination?: PaginationParams,
  ): Promise<PaginatedResult<Plan>> {
    try {
      const page = pagination?.page ?? 1;
      const limit = pagination?.limit ?? 10;
      const skip = (page - 1) * limit;

      const where = { missionId };

      const [data, total] = await this.prisma.$transaction([
        this.prisma.plan.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: "desc" },
        }),
        this.prisma.plan.count({ where }),
      ]);

      return {
        data: data as unknown as Plan[],
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async updatePlan(id: string, data: UpdatePlanDto): Promise<Plan> {
    try {
      const plan = await this.prisma.plan.update({
        where: { id },
        data: {
          missionId: data.missionId,
          title: data.title,
          goalInput: data.goalInput,
          planningHorizon: data.planningHorizon,
          priority: data.priority,
          constraints: data.constraints,
          desiredOutcomes: data.desiredOutcomes,
        },
      });
      return plan as unknown as Plan;
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async deletePlan(id: string): Promise<Plan> {
    try {
      const plan = await this.prisma.plan.delete({
        where: { id },
      });
      return plan as unknown as Plan;
    } catch (error) {
      handlePrismaError(error);
    }
  }
}
