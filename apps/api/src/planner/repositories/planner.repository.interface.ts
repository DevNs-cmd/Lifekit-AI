import { CreatePlanDto } from "../dto/create-plan.dto";
import { UpdatePlanDto } from "../dto/update-plan.dto";
import { Plan } from "../entities/plan.entity";
import {
  PaginationParams,
  PaginatedResult,
} from "../../common/interfaces/pagination.interface";

export interface IPlannerRepository {
  createPlan(userId: number, data: CreatePlanDto): Promise<Plan>;
  findPlanById(id: number): Promise<Plan | null>;
  findPlansByMission(
    missionId: number,
    pagination?: PaginationParams,
  ): Promise<PaginatedResult<Plan>>;
  updatePlan(id: number, data: UpdatePlanDto): Promise<Plan>;
  deletePlan(id: number): Promise<Plan>;
}
