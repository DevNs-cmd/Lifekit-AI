import { NotFoundException, ForbiddenException } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { LifeMissionService } from "./life-mission.service";
import { LifeMissionRepository } from "../repositories/life-mission.repository";
import { CreateLifeMissionDto } from "../dto/create-life-mission.dto";
import { LifeMission } from "../entities/life-mission.entity";
import { MissionStatus, PriorityLevel } from "../../common/enums";

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------
const mockMissionRepository = {
  createMission: jest.fn(),
  findMissionById: jest.fn(),
  findUserMissions: jest.fn(),
  updateMission: jest.fn(),
  deleteMission: jest.fn(),
};

function createMockMission(overrides: Partial<LifeMission> = {}): LifeMission {
  const mission = {
    mission_id: 1,
    user_id: 123,
    title: "Achieve Financial Independence",
    description: "Build savings and passive income streams.",
    category: "Financial",
    priority: PriorityLevel.MEDIUM,
    status: MissionStatus.ACTIVE,
    progress: 0,
    isArchived: false,
    archivedAt: null,
    start_date: new Date("2026-08-01"),
    target_date: new Date("2035-12-31"),
    created_at: new Date(),
    updated_at: new Date(),
    ...overrides,
  } as any;

  return mission;
}

describe("LifeMissionService", () => {
  let service: LifeMissionService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LifeMissionService,
        {
          provide: LifeMissionRepository,
          useValue: mockMissionRepository,
        },
      ],
    }).compile();

    service = module.get<LifeMissionService>(LifeMissionService);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("create", () => {
    it("should create a mission via the repository", async () => {
      const dto = {
        title: "Mission",
        description: "desc",
        goals: ["g1"],
        values: ["v1"],
        longTermObjectives: ["o1"],
        startDate: "2026-08-01",
        targetDate: "2035-12-31",
      } as CreateLifeMissionDto;
      const created = createMockMission();
      mockMissionRepository.createMission.mockResolvedValue(created);

      const result = await service.create(123, dto);
      expect(mockMissionRepository.createMission).toHaveBeenCalledWith(
        123,
        dto,
      );
      expect(result).toEqual(created);
    });

    it("should propagate repository errors", async () => {
      mockMissionRepository.createMission.mockRejectedValue(
        new Error("DB error"),
      );
      await expect(
        service.create(123, {} as CreateLifeMissionDto),
      ).rejects.toThrow("DB error");
    });
  });

  describe("findAll", () => {
    it("should return paginated missions", async () => {
      const paginated = {
        data: [createMockMission()],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      };
      mockMissionRepository.findUserMissions.mockResolvedValue(paginated);

      const result = await service.findAll(
        123,
        { status: "ACTIVE" },
        { page: 1, limit: 10 },
      );
      expect(mockMissionRepository.findUserMissions).toHaveBeenCalledWith(
        123,
        { status: "ACTIVE" },
        { page: 1, limit: 10 },
      );
      expect(result).toEqual(paginated);
    });
  });

  describe("findOne", () => {
    it("should return a mission owned by the user", async () => {
      const mission = createMockMission({ user_id: 123 });
      mockMissionRepository.findMissionById.mockResolvedValue(mission);

      const result = await service.findOne(1, 123);
      expect(result).toEqual(mission);
    });

    it("should throw NotFoundException when mission does not exist", async () => {
      mockMissionRepository.findMissionById.mockResolvedValue(null);
      await expect(service.findOne(1, 123)).rejects.toThrow(NotFoundException);
    });

    it("should throw ForbiddenException when mission belongs to another user", async () => {
      const mission = createMockMission({ user_id: 999 });
      mockMissionRepository.findMissionById.mockResolvedValue(mission);
      await expect(service.findOne(1, 123)).rejects.toThrow(ForbiddenException);
    });
  });

  describe("update", () => {
    it("should allow owner to update a mission", async () => {
      const mission = createMockMission({ user_id: 123 });
      const updated = createMockMission({ title: "Updated" });
      mockMissionRepository.findMissionById.mockResolvedValue(mission);
      mockMissionRepository.updateMission.mockResolvedValue(updated);

      const result = await service.update(1, 123, { title: "Updated" });
      expect(result).toEqual(updated);
    });

    it("should throw ForbiddenException for non-owner", async () => {
      const mission = createMockMission({ user_id: 999 });
      mockMissionRepository.findMissionById.mockResolvedValue(mission);
      await expect(
        service.update(1, 123, { title: "Updated" }),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe("remove", () => {
    it("should allow owner to delete a mission", async () => {
      const mission = createMockMission({ user_id: 123 });
      mockMissionRepository.findMissionById.mockResolvedValue(mission);
      mockMissionRepository.deleteMission.mockResolvedValue(mission);

      const result = await service.remove(1, 123);
      expect(result).toEqual(mission);
    });

    it("should throw NotFoundException when mission missing", async () => {
      mockMissionRepository.findMissionById.mockResolvedValue(null);
      await expect(service.remove(1, 123)).rejects.toThrow(NotFoundException);
    });
  });
});
