import { CreateLifeMissionDto } from "../dto/create-life-mission.dto";
import { UpdateLifeMissionDto } from "../dto/update-life-mission.dto";
import { LifeMission } from "../entities/life-mission.entity";
import {
  PaginationParams,
  PaginatedResult,
} from "../../common/interfaces/pagination.interface";

export interface ILifeMissionRepository {
  createMission(
    userId: number,
    data: CreateLifeMissionDto,
  ): Promise<LifeMission>;
  findMissionById(id: number): Promise<LifeMission | null>;
  findUserMissions(
    userId: number,
    filters?: {
      status?: string;
      startDate?: Date;
      targetDate?: Date;
      category?: string;
      priority?: string;
    },
    pagination?: PaginationParams,
  ): Promise<PaginatedResult<LifeMission>>;
  updateMission(id: number, data: UpdateLifeMissionDto): Promise<LifeMission>;
  deleteMission(id: number): Promise<LifeMission>;
}
