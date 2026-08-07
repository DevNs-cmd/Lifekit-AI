import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from "@nestjs/common";
import { PlannerRepository } from "../repositories/planner.repository";
import { LifeMissionRepository } from "../../life-mission/repositories/life-mission.repository";
import { CreatePlanDto } from "../dto/create-plan.dto";
import { UpdatePlanDto } from "../dto/update-plan.dto";
import { GeneratePlanRequestDto } from "../dto/generate-plan-request.dto";
import { Plan } from "../entities/plan.entity";
import {
  PaginationParams,
  PaginatedResult,
} from "../../common/interfaces/pagination.interface";
import { AppConfigService } from "../../config/app-config.service";

@Injectable()
export class PlannerService {
  constructor(
    private readonly plannerRepository: PlannerRepository,
    private readonly missionRepository: LifeMissionRepository,
    private readonly config: AppConfigService,
  ) {}

  /**
   * Generates a concrete execution plan by calling the FastAPI AI Orchestrator service.
   */
  async generate(
    userId: number,
    dto: GeneratePlanRequestDto,
  ): Promise<any> {
    if (!dto.goalInput || !dto.planningHorizon || !dto.priority) {
      throw new BadRequestException(
        "goalInput, planningHorizon, and priority are required",
      );
    }

    const aiServiceUrl = this.config.aiServiceUrl;
    if (!aiServiceUrl) {
      throw new Error("AI Service URL is not configured");
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);

    try {
      const response = await fetch(`${aiServiceUrl}/api/v1/orchestrate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: String(userId),
          message: dto.goalInput,
          session_id: `sess-${userId}-${Date.now()}`,
          context: {
            planningHorizon: dto.planningHorizon,
            priority: dto.priority,
            userConstraints: dto.userConstraints || [],
          },
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`AI service returned status ${response.status}: ${await response.text()}`);
      }

      const resJson: any = await response.json();
      const plan = resJson.plan || {};
      const domainResult = resJson.domain_result || {};

      return {
        title: plan.title || `Mission: ${dto.goalInput.slice(0, 60)}`,
        description: domainResult.advice || plan.title || dto.goalInput,
        category: "lifestyle",
        goal: dto.goalInput,
        estimatedDurationWeeks: Math.ceil((plan.total_estimated_days || 84) / 7),
        milestones: (plan.steps || []).map((step: any) => ({
          id: `ms-gen-${step.order}`,
          title: step.task,
          description: step.task,
          status: "pending",
          progress: 0,
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + (step.estimated_days || 14) * 86400000).toISOString(),
          tasks: [],
          resources: [],
          dependencies: [],
          order: step.order,
        })),
        successMetrics: [
          {
            id: "sm-gen-1",
            description: "All milestones accomplished on schedule",
            measurable: true,
            achieved: false,
          },
        ],
        risks: (domainResult.risks || ["Competing priorities from other schedules"]).map((risk: any, index: number) => ({
          id: `r-gen-${index}`,
          description: typeof risk === "string" ? risk : (risk.description || "Identified execution risk"),
          severity: "medium",
          mitigation: "Establish weekly focused blocks",
        })),
        resources: (domainResult.resources || []).map((res: any) => ({
          title: typeof res === "string" ? res : (res.title || "Resource Link"),
          description: typeof res === "string" ? res : (res.description || ""),
          url: typeof res === "string" ? "" : (res.url || ""),
          type: "link",
        })),
      };
    } catch (err: any) {
      clearTimeout(timeoutId);
      throw new Error(`AI Service connection failed: ${err.message}`);
    }
  }

  async create(userId: number, dto: CreatePlanDto): Promise<Plan> {
    if (dto.missionId) {
      const mission = await this.missionRepository.findMissionById(
        dto.missionId,
      );
      if (!mission) {
        throw new NotFoundException("Life mission not found");
      }
      if (mission.user_id !== userId) {
        throw new ForbiddenException(
          "You do not have permission to attach plans to this mission",
        );
      }
    }
    return this.plannerRepository.createPlan(userId, dto);
  }

  async findOne(id: number, userId: number): Promise<Plan> {
    const plan = await this.plannerRepository.findPlanById(id);
    if (!plan) {
      throw new NotFoundException("Plan not found");
    }
    if (plan.user_id !== userId) {
      throw new ForbiddenException(
        "You do not have permission to access this plan",
      );
    }
    return plan;
  }

  async findAllByMission(
    userId: number,
    missionId: number,
    pagination?: PaginationParams,
  ): Promise<PaginatedResult<Plan>> {
    const mission = await this.missionRepository.findMissionById(missionId);
    if (!mission) {
      throw new NotFoundException("Life mission not found");
    }
    if (mission.user_id !== userId) {
      throw new ForbiddenException(
        "You do not have permission to access plans for this mission",
      );
    }
    return this.plannerRepository.findPlansByMission(missionId, pagination);
  }

  async update(id: number, userId: number, dto: UpdatePlanDto): Promise<Plan> {
    await this.findOne(id, userId); // verify ownership
    if (dto.missionId) {
      const mission = await this.missionRepository.findMissionById(
        dto.missionId,
      );
      if (!mission || mission.user_id !== userId) {
        throw new ForbiddenException(
          "You do not have permission to link to this mission",
        );
      }
    }
    return this.plannerRepository.updatePlan(id, dto);
  }

  async remove(id: number, userId: number): Promise<Plan> {
    await this.findOne(id, userId); // verify ownership
    return this.plannerRepository.deletePlan(id);
  }
}
