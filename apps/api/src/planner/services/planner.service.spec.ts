import {
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { PlannerService } from "./planner.service";
import { PlannerRepository } from "../repositories/planner.repository";
import { LifeMissionRepository } from "../../life-mission/repositories/life-mission.repository";
import { CreatePlanDto, PlanningHorizon } from "../dto/create-plan.dto";
import { GeneratePlanRequestDto } from "../dto/generate-plan-request.dto";
import { Plan } from "../entities/plan.entity";
import { PriorityLevel, MissionStatus } from "../../common/enums";

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------
const mockPlannerRepository = {
  createPlan: jest.fn(),
  findPlanById: jest.fn(),
  findPlansByMission: jest.fn(),
  updatePlan: jest.fn(),
  deletePlan: jest.fn(),
};

const mockMissionRepository = {
  findMissionById: jest.fn(),
};

function createMockPlan(overrides: Partial<Plan> = {}): Plan {
  const plan = {
    goal_id: 1,
    user_id: 123,
    title: "Q3 Physical Health Plan",
    goalInput: "Improve cardiorespiratory endurance",
    planningHorizon: PlanningHorizon.QUARTERLY,
    priority: PriorityLevel.HIGH,
    constraints: [],
    desiredOutcomes: ["5k under 22m"],
    created_at: new Date(),
    missionId: null,
    ...overrides,
  } as any;
  return plan;
}

function createMockMission(overrides: any = {}): any {
  return {
    mission_id: 1,
    user_id: 123,
    title: "Mission",
    description: "desc",
    status: MissionStatus.ACTIVE,
    priority: PriorityLevel.MEDIUM,
    ...overrides,
  };
}

describe("PlannerService", () => {
  let service: PlannerService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PlannerService,
        { provide: PlannerRepository, useValue: mockPlannerRepository },
        { provide: LifeMissionRepository, useValue: mockMissionRepository },
      ],
    }).compile();

    service = module.get<PlannerService>(PlannerService);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("generate", () => {
    it("should return a placeholder response for valid input", async () => {
      const dto = {
        goalInput: "Run 5k under 22 minutes",
        planningHorizon: PlanningHorizon.WEEKLY,
        priority: PriorityLevel.MEDIUM,
        userConstraints: ["No equipment"],
      } as GeneratePlanRequestDto;

      const result = await service.generate(123, dto);
      expect(result).toEqual({
        message: "Plan generation request received",
        received: dto,
        userId: 123,
      });
    });

    it("should throw BadRequestException when required fields missing", async () => {
      const dto = {
        planningHorizon: PlanningHorizon.WEEKLY,
        priority: PriorityLevel.MEDIUM,
      } as GeneratePlanRequestDto;
      await expect(service.generate(123, dto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe("create", () => {
    it("should create a plan without a mission", async () => {
      const dto = {
        title: "Plan",
        goalInput: "goal",
        planningHorizon: PlanningHorizon.DAILY,
        priority: PriorityLevel.MEDIUM,
        desiredOutcomes: ["outcome"],
      } as CreatePlanDto;
      const created = createMockPlan();
      mockPlannerRepository.createPlan.mockResolvedValue(created);

      const result = await service.create(123, dto);
      expect(mockPlannerRepository.createPlan).toHaveBeenCalledWith(123, dto);
      expect(result).toEqual(created);
    });

    it("should throw NotFoundException when mission missing", async () => {
      const dto = {
        missionId: 1,
        title: "Plan",
        goalInput: "goal",
        planningHorizon: PlanningHorizon.DAILY,
        priority: PriorityLevel.MEDIUM,
        desiredOutcomes: ["outcome"],
      } as CreatePlanDto;
      mockMissionRepository.findMissionById.mockResolvedValue(null);
      await expect(service.create(123, dto)).rejects.toThrow(NotFoundException);
    });

    it("should throw ForbiddenException for non-owner", async () => {
      const dto = {
        missionId: 1,
        title: "Plan",
        goalInput: "goal",
        planningHorizon: PlanningHorizon.DAILY,
        priority: PriorityLevel.MEDIUM,
        desiredOutcomes: ["outcome"],
      } as CreatePlanDto;
      mockMissionRepository.findMissionById.mockResolvedValue(
        createMockMission({ user_id: 999 }),
      );
      await expect(service.create(123, dto)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe("findOne", () => {
    it("should return a plan owned by the user", async () => {
      const plan = createMockPlan({ user_id: 123 });
      mockPlannerRepository.findPlanById.mockResolvedValue(plan);

      const result = await service.findOne(1, 123);
      expect(result).toEqual(plan);
    });

    it("should throw NotFoundException when plan missing", async () => {
      mockPlannerRepository.findPlanById.mockResolvedValue(null);
      await expect(service.findOne(1, 123)).rejects.toThrow(NotFoundException);
    });

    it("should throw ForbiddenException for non-owner", async () => {
      mockPlannerRepository.findPlanById.mockResolvedValue(
        createMockPlan({ user_id: 999 }),
      );
      await expect(service.findOne(1, 123)).rejects.toThrow(ForbiddenException);
    });
  });

  describe("findAllByMission", () => {
    it("should throw NotFoundException when mission missing", async () => {
      mockMissionRepository.findMissionById.mockResolvedValue(null);
      await expect(service.findAllByMission(123, 1)).rejects.toThrow(
        NotFoundException,
      );
    });

    it("should throw ForbiddenException for non-owner", async () => {
      mockMissionRepository.findMissionById.mockResolvedValue(
        createMockMission({ user_id: 999 }),
      );
      await expect(service.findAllByMission(123, 1)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it("should return paginated plans", async () => {
      const paginated = {
        data: [createMockPlan()],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      };
      mockMissionRepository.findMissionById.mockResolvedValue(
        createMockMission({ user_id: 123 }),
      );
      mockPlannerRepository.findPlansByMission.mockResolvedValue(paginated);

      const result = await service.findAllByMission(123, 1, {
        page: 1,
        limit: 10,
      });
      expect(mockPlannerRepository.findPlansByMission).toHaveBeenCalledWith(1, {
        page: 1,
        limit: 10,
      });
      expect(result).toEqual(paginated);
    });
  });

  describe("update", () => {
    it("should allow owner to update a plan", async () => {
      const plan = createMockPlan({ user_id: 123 });
      const updated = createMockPlan({ title: "Updated" });
      mockPlannerRepository.findPlanById.mockResolvedValue(plan);
      mockPlannerRepository.updatePlan.mockResolvedValue(updated);

      const result = await service.update(1, 123, { title: "Updated" });
      expect(result).toEqual(updated);
    });

    it("should throw ForbiddenException for non-owner", async () => {
      mockPlannerRepository.findPlanById.mockResolvedValue(
        createMockPlan({ user_id: 999 }),
      );
      await expect(
        service.update(1, 123, { title: "Updated" }),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe("remove", () => {
    it("should allow owner to delete a plan", async () => {
      const plan = createMockPlan({ user_id: 123 });
      mockPlannerRepository.findPlanById.mockResolvedValue(plan);
      mockPlannerRepository.deletePlan.mockResolvedValue(plan);

      const result = await service.remove(1, 123);
      expect(result).toEqual(plan);
    });

    it("should throw NotFoundException when plan missing", async () => {
      mockPlannerRepository.findPlanById.mockResolvedValue(null);
      await expect(service.remove(1, 123)).rejects.toThrow(NotFoundException);
    });
  });
});
