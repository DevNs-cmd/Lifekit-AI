import { CreateLifeMissionDto } from '../dto/create-life-mission.dto';
import { UpdateLifeMissionDto } from '../dto/update-life-mission.dto';
import { LifeMission } from '../entities/life-mission.entity';
import { PaginationParams, PaginatedResult } from '../../common/interfaces/pagination.interface';

export interface ILifeMissionRepository {
  createMission(userId: string, data: CreateLifeMissionDto): Promise<LifeMission>;
  findMissionById(id: string): Promise<LifeMission | null>;
  findUserMissions(
    userId: string,
    filters?: { status?: string; startDate?: Date; targetDate?: Date },
    pagination?: PaginationParams,
  ): Promise<PaginatedResult<LifeMission>>;
  updateMission(id: string, data: UpdateLifeMissionDto): Promise<LifeMission>;
  deleteMission(id: string): Promise<LifeMission>;
}
