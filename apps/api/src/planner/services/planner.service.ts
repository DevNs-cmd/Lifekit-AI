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

@Injectable()
export class PlannerService {
  constructor(
    private readonly plannerRepository: PlannerRepository,
    private readonly missionRepository: LifeMissionRepository,
  ) {}

  /**
   * Placeholder integration point for the AI planner service.
   *
   * Validates the incoming request shape and returns an echo response without
   * invoking any AI logic. This endpoint is intentionally minimal to allow the
   * frontend to integrate against a stable contract while the AI service is
   * wired up in a future iteration.
   */
  async generate(
    userId: number,
    dto: GeneratePlanRequestDto,
  ): Promise<{
    message: string;
    received: GeneratePlanRequestDto;
    userId: number;
  }> {
    if (!dto.goalInput || !dto.planningHorizon || !dto.priority) {
      throw new BadRequestException(
        "goalInput, planningHorizon, and priority are required",
      );
    }
    return {
      message: "Plan generation request received",
      received: dto,
      userId,
    };
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
