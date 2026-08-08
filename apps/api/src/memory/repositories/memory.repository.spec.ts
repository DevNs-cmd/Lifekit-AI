import { Test, TestingModule } from "@nestjs/testing";
import { MemoryRepository } from "./memory.repository";
import { PrismaService } from "../../prisma/prisma.service";
import { MemoryType } from "../dto/create-memory.dto";

describe("MemoryRepository", () => {
  let repository: MemoryRepository;

  const mockPrismaService = {
    ai_memory: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MemoryRepository,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    repository = module.get<MemoryRepository>(MemoryRepository);
  });

  describe("createMemory", () => {
    it("should handle memoryType field when type is undefined", async () => {
      const createdRecord = {
        memory_id: 1,
        user_id: 123,
        content: JSON.stringify({ text: "Test content", metadata: {}, contextInfo: null }),
        memory_type: "GOAL",
        importance_score: 0.9,
        created_at: new Date(),
        updated_at: new Date(),
      };
      mockPrismaService.ai_memory.create.mockResolvedValue(createdRecord);

      const result = await repository.createMemory(123, {
        content: "Test content",
        memoryType: MemoryType.GOAL,
        importanceScore: 0.9,
      } as any);

      expect(mockPrismaService.ai_memory.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          user_id: 123,
          memory_type: "GOAL",
          importance_score: 0.9,
        }),
      });
      expect(result).toBeDefined();
      expect(result.content).toBe("Test content");
    });

    it("should default memory_type to CONTEXT when neither type nor memoryType is provided", async () => {
      const createdRecord = {
        memory_id: 2,
        user_id: 123,
        content: JSON.stringify({ text: "Test content", metadata: {}, contextInfo: null }),
        memory_type: "CONTEXT",
        importance_score: null,
        created_at: new Date(),
        updated_at: new Date(),
      };
      mockPrismaService.ai_memory.create.mockResolvedValue(createdRecord);

      await repository.createMemory(123, { content: "Test content" } as any);

      expect(mockPrismaService.ai_memory.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          memory_type: "CONTEXT",
        }),
      });
    });
  });
});
