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

  async createPlan(userId: number, data: CreatePlanDto): Promise<Plan> {
    try {
      const serializedDescription = JSON.stringify({
        goalInput: data.goalInput,
        planningHorizon: data.planningHorizon,
        priority: data.priority,
        constraints: data.constraints ?? [],
        desiredOutcomes: data.desiredOutcomes ?? [],
        missionId: data.missionId ?? null,
      });

      const goal = await this.prisma.goals.create({
        data: {
          user_id: userId,
          title: data.title,
          description: serializedDescription,
          category: data.planningHorizon,
          status: "In Progress",
          progress: 0,
        },
      });

      return mapPrismaGoalToPlan(goal);
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async findPlanById(id: number): Promise<Plan | null> {
    try {
      const goal = await this.prisma.goals.findUnique({
        where: { goal_id: id },
      });
      if (!goal) return null;
      return mapPrismaGoalToPlan(goal);
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async findPlansByMission(
    missionId: number,
    pagination?: PaginationParams,
  ): Promise<PaginatedResult<Plan>> {
    try {
      const page = pagination?.page ?? 1;
      const limit = Math.min(pagination?.limit ?? 10, 100);
      const skip = (page - 1) * limit;

      // Filter by serialized missionId in description
      const where = {
        description: {
          contains: `"missionId":${missionId}`,
        },
      };

      const [data, total] = await this.prisma.$transaction([
        this.prisma.goals.findMany({
          where,
          skip,
          take: limit,
          orderBy: { created_at: "desc" },
        }),
        this.prisma.goals.count({ where }),
      ]);

      return {
        data: data.map((g) => mapPrismaGoalToPlan(g)),
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async updatePlan(id: number, data: UpdatePlanDto): Promise<Plan> {
    try {
      const existing = await this.prisma.goals.findUnique({
        where: { goal_id: id },
      });

      if (!existing) {
        throw new Error("Plan not found");
      }

      let goalInput = data.goalInput;
      let planningHorizon = data.planningHorizon;
      let priority = data.priority;
      let constraints = data.constraints;
      let desiredOutcomes = data.desiredOutcomes;
      let missionId = data.missionId;

      try {
        const parsed = JSON.parse(existing.description || "{}");
        if (goalInput === undefined) goalInput = parsed.goalInput;
        if (planningHorizon === undefined)
          planningHorizon = parsed.planningHorizon;
        if (priority === undefined) priority = parsed.priority;
        if (constraints === undefined) constraints = parsed.constraints;
        if (desiredOutcomes === undefined)
          desiredOutcomes = parsed.desiredOutcomes;
        if (missionId === undefined) missionId = parsed.missionId;
      } catch {
        // legacy
      }

      const serializedDescription = JSON.stringify({
        goalInput: goalInput ?? "",
        planningHorizon: planningHorizon ?? "DAILY",
        priority: priority ?? "MEDIUM",
        constraints: constraints ?? [],
        desiredOutcomes: desiredOutcomes ?? [],
        missionId: missionId ?? null,
      });

      const updatePayload: any = {
        description: serializedDescription,
      };

      if (data.title !== undefined) updatePayload.title = data.title;
      if (data.planningHorizon !== undefined)
        updatePayload.category = data.planningHorizon;

      const goal = await this.prisma.goals.update({
        where: { goal_id: id },
        data: updatePayload,
      });

      return mapPrismaGoalToPlan(goal);
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async deletePlan(id: number): Promise<Plan> {
    try {
      const goal = await this.prisma.goals.findUnique({
        where: { goal_id: id },
      });
      if (goal) {
        await this.prisma.goals.delete({
          where: { goal_id: id },
        });
      }
      return mapPrismaGoalToPlan(goal!)!;
    } catch (error) {
      handlePrismaError(error);
    }
  }
}

function mapPrismaGoalToPlan(g: any): Plan {
  if (!g) return null as any;

  let goalInput = "";
  let planningHorizon = "DAILY";
  let priority = "MEDIUM";
  let constraints: string[] = [];
  let desiredOutcomes: string[] = [];
  let missionId = null;

  try {
    const parsed = JSON.parse(g.description || "{}");
    goalInput = parsed.goalInput ?? "";
    planningHorizon = parsed.planningHorizon ?? "DAILY";
    priority = parsed.priority ?? "MEDIUM";
    constraints = parsed.constraints ?? [];
    desiredOutcomes = parsed.desiredOutcomes ?? [];
    missionId = parsed.missionId ?? null;
  } catch {
    // legacy text
  }

  return {
    goal_id: g.goal_id,
    user_id: g.user_id,
    title: g.title,
    goalInput,
    planningHorizon: planningHorizon as any,
    priority: priority as any,
    constraints,
    desiredOutcomes,
    created_at: g.created_at,
    missionId,
  } as unknown as Plan;
}
