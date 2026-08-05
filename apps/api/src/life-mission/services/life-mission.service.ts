import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from "@nestjs/common";
import { LifeMissionRepository } from "../repositories/life-mission.repository";
import { CreateLifeMissionDto } from "../dto/create-life-mission.dto";
import { UpdateLifeMissionDto } from "../dto/update-life-mission.dto";
import { LifeMission } from "../entities/life-mission.entity";
import {
  PaginationParams,
  PaginatedResult,
} from "../../common/interfaces/pagination.interface";

@Injectable()
export class LifeMissionService {
  constructor(private readonly missionRepository: LifeMissionRepository) {}

  async create(
    userId: number,
    dto: CreateLifeMissionDto,
  ): Promise<LifeMission> {
    return this.missionRepository.createMission(userId, dto);
  }

  async findAll(
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
    return this.missionRepository.findUserMissions(userId, filters, pagination);
  }

  async findOne(id: number, userId: number): Promise<LifeMission> {
    const mission = await this.missionRepository.findMissionById(id);
    if (!mission) {
      throw new NotFoundException("Life mission not found");
    }
    if (mission.user_id !== userId) {
      throw new ForbiddenException(
        "You do not have permission to access this mission",
      );
    }
    return mission;
  }

  async update(
    id: number,
    userId: number,
    dto: UpdateLifeMissionDto,
  ): Promise<LifeMission> {
    await this.findOne(id, userId); // verify ownership and existence
    return this.missionRepository.updateMission(id, dto);
  }

  async remove(id: number, userId: number): Promise<LifeMission> {
    await this.findOne(id, userId); // verify ownership and existence
    return this.missionRepository.deleteMission(id);
  }
}
export { LifeMission };
