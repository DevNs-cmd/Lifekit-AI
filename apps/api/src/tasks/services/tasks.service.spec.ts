import { NotFoundException, ForbiddenException } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { TasksService } from "./tasks.service";
import { TaskRepository } from "../repositories/task.repository";
import { LifeMissionRepository } from "../../life-mission/repositories/life-mission.repository";
import { CreateTaskDto, TaskStatus } from "../dto/create-task.dto";
import { Task } from "../entities/task.entity";
import { MissionStatus, PriorityLevel } from "../../common/enums";

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------
const mockTaskRepository = {
  createTask: jest.fn(),
  findTaskById: jest.fn(),
  findTasksByMission: jest.fn(),
  updateTaskStatus: jest.fn(),
  updateTask: jest.fn(),
  deleteTask: jest.fn(),
};

const mockMissionRepository = {
  findMissionById: jest.fn(),
};

function createMockTask(overrides: Partial<Task> = {}): Task {
  const task = {
    task_id: 1,
    mission_id: 1,
    title: "Buy new running shoes",
    description: "Ensure shoes support road running.",
    status: TaskStatus.PENDING,
    priority: "Medium",
    due_date: new Date("2026-08-05"),
    estimated_time: 60,
    completed_at: null,
    created_at: new Date(),
    ...overrides,
  } as any;
  return task;
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

describe("TasksService", () => {
  let service: TasksService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        { provide: TaskRepository, useValue: mockTaskRepository },
        { provide: LifeMissionRepository, useValue: mockMissionRepository },
      ],
    }).compile();

    service = module.get<TasksService>(TasksService);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("create", () => {
    it("should throw NotFoundException when missionId is missing", async () => {
      const dto = {
        title: "Task",
        status: TaskStatus.PENDING,
        priority: "Medium",
        dueDate: "2026-08-05",
      } as CreateTaskDto;
      await expect(service.create(123, dto)).rejects.toThrow(
        "Parent mission ID must be provided",
      );
    });

    it("should throw NotFoundException when mission does not exist", async () => {
      const dto = {
        missionId: 1,
        title: "Task",
        status: TaskStatus.PENDING,
        priority: "Medium",
        dueDate: "2026-08-05",
      } as CreateTaskDto;
      mockMissionRepository.findMissionById.mockResolvedValue(null);
      await expect(service.create(123, dto)).rejects.toThrow(
        "Associated life mission not found",
      );
    });

    it("should throw ForbiddenException for non-owner", async () => {
      const dto = {
        missionId: 1,
        title: "Task",
        status: TaskStatus.PENDING,
        priority: "Medium",
        dueDate: "2026-08-05",
      } as CreateTaskDto;
      mockMissionRepository.findMissionById.mockResolvedValue(
        createMockMission({ user_id: 999 }),
      );
      await expect(service.create(123, dto)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it("should create a task for the owner", async () => {
      const dto = {
        missionId: 1,
        title: "Task",
        status: TaskStatus.PENDING,
        priority: "Medium",
        dueDate: "2026-08-05",
      } as CreateTaskDto;
      const created = createMockTask();
      mockMissionRepository.findMissionById.mockResolvedValue(
        createMockMission({ user_id: 123 }),
      );
      mockTaskRepository.createTask.mockResolvedValue(created);

      const result = await service.create(123, dto);
      expect(mockTaskRepository.createTask).toHaveBeenCalledWith(1, dto);
      expect(result).toEqual(created);
    });
  });

  describe("findOne", () => {
    it("should throw NotFoundException when task missing", async () => {
      mockTaskRepository.findTaskById.mockResolvedValue(null);
      await expect(service.findOne(1, 123)).rejects.toThrow(NotFoundException);
    });

    it("should throw ForbiddenException when mission not owned by user", async () => {
      mockTaskRepository.findTaskById.mockResolvedValue(createMockTask());
      mockMissionRepository.findMissionById.mockResolvedValue(
        createMockMission({ user_id: 999 }),
      );
      await expect(service.findOne(1, 123)).rejects.toThrow(ForbiddenException);
    });

    it("should return task when owned", async () => {
      const task = createMockTask();
      mockTaskRepository.findTaskById.mockResolvedValue(task);
      mockMissionRepository.findMissionById.mockResolvedValue(
        createMockMission({ mission_id: 1, user_id: 123 }),
      );
      const result = await service.findOne(1, 123);
      expect(result).toEqual(task);
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

    it("should return paginated tasks", async () => {
      const paginated = {
        data: [createMockTask()],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      };
      mockMissionRepository.findMissionById.mockResolvedValue(
        createMockMission({ user_id: 123 }),
      );
      mockTaskRepository.findTasksByMission.mockResolvedValue(paginated);

      const result = await service.findAllByMission(
        123,
        1,
        {},
        { page: 1, limit: 10 },
      );
      expect(mockTaskRepository.findTasksByMission).toHaveBeenCalledWith(
        1,
        {},
        { page: 1, limit: 10 },
      );
      expect(result).toEqual(paginated);
    });
  });

  describe("update", () => {
    it("should update a task owned by the user", async () => {
      const task = createMockTask();
      const updated = createMockTask({ title: "Updated" });
      mockTaskRepository.findTaskById.mockResolvedValue(task);
      mockMissionRepository.findMissionById.mockResolvedValue(
        createMockMission({ mission_id: 1, user_id: 123 }),
      );
      mockTaskRepository.updateTask.mockResolvedValue(updated);

      const result = await service.update(1, 123, { title: "Updated" });
      expect(result).toEqual(updated);
    });

    it("should throw ForbiddenException for non-owner", async () => {
      mockTaskRepository.findTaskById.mockResolvedValue(createMockTask());
      mockMissionRepository.findMissionById.mockResolvedValue(
        createMockMission({ user_id: 999 }),
      );
      await expect(
        service.update(1, 123, { title: "Updated" }),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe("updateStatus", () => {
    it("should update status of an owned task", async () => {
      const task = createMockTask();
      const completed = createMockTask({ status: TaskStatus.COMPLETED });
      mockTaskRepository.findTaskById.mockResolvedValue(task);
      mockMissionRepository.findMissionById.mockResolvedValue(
        createMockMission({ mission_id: 1, user_id: 123 }),
      );
      mockTaskRepository.updateTaskStatus.mockResolvedValue(completed);

      const result = await service.updateStatus(1, 123, TaskStatus.COMPLETED);
      expect(mockTaskRepository.updateTaskStatus).toHaveBeenCalledWith(
        1,
        TaskStatus.COMPLETED,
      );
      expect(result).toEqual(completed);
    });
  });

  describe("remove", () => {
    it("should delete an owned task", async () => {
      const task = createMockTask();
      mockTaskRepository.findTaskById.mockResolvedValue(task);
      mockMissionRepository.findMissionById.mockResolvedValue(
        createMockMission({ mission_id: 1, user_id: 123 }),
      );
      mockTaskRepository.deleteTask.mockResolvedValue(task);

      const result = await service.remove(1, 123);
      expect(result).toEqual(task);
    });
  });
});
