import { CreatePlanDto } from '../dto/create-plan.dto';
import { UpdatePlanDto } from '../dto/update-plan.dto';
import { Plan } from '../entities/plan.entity';
import { PaginationParams, PaginatedResult } from '../../common/interfaces/pagination.interface';

export interface IPlannerRepository {
  createPlan(userId: string, data: CreatePlanDto): Promise<Plan>;
  findPlanById(id: string): Promise<Plan | null>;
  findPlansByMission(
    missionId: string,
    pagination?: PaginationParams,
  ): Promise<PaginatedResult<Plan>>;
  updatePlan(id: string, data: UpdatePlanDto): Promise<Plan>;
  deletePlan(id: string): Promise<Plan>;
}
