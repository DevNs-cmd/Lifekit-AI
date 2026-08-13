import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { LifeMissionRepository } from "../repositories/life-mission.repository";
import { CreateLifeMissionDto } from "../dto/create-life-mission.dto";
import { UpdateLifeMissionDto } from "../dto/update-life-mission.dto";
import { LifeMission } from "../entities/life-mission.entity";
import {
  PaginationParams,
  PaginatedResult,
} from "../../common/interfaces/pagination.interface";
import {
  MISSION_EVENTS,
  MissionCreatedEvent,
  MissionUpdatedEvent,
} from "../../common/events/mission-events";

@Injectable()
export class LifeMissionService {
  constructor(
    private readonly missionRepository: LifeMissionRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async create(
    userId: number,
    dto: CreateLifeMissionDto,
  ): Promise<LifeMission> {
    const mission = await this.missionRepository.createMission(userId, dto);

    // Fire-and-forget — listeners refresh AI content in the background
    this.eventEmitter.emit(
      MISSION_EVENTS.CREATED,
      new MissionCreatedEvent(
        userId,
        mission.id ?? (mission as any).mission_id,
        mission.title,
        (mission as any).category ?? null,
      ),
    );

    return mission;
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
    const mission = await this.missionRepository.updateMission(id, dto);

    // Refresh AI content so marketplace/opportunities reflect the updated mission
    this.eventEmitter.emit(
      MISSION_EVENTS.UPDATED,
      new MissionUpdatedEvent(
        userId,
        mission.id ?? (mission as any).mission_id,
        mission.title,
        (mission as any).category ?? null,
      ),
    );

    return mission;
  }

  async remove(id: number, userId: number): Promise<LifeMission> {
    await this.findOne(id, userId); // verify ownership and existence
    return this.missionRepository.deleteMission(id);
  }

  async getDistinctCategories(): Promise<string[]> {
    return this.missionRepository.getDistinctCategories();
  }
}
export { LifeMission };
