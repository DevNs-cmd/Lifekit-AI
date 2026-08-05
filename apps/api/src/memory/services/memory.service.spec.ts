import { NotFoundException, ForbiddenException } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { MemoryService } from "./memory.service";
import { MemoryRepository } from "../repositories/memory.repository";
import { CreateMemoryDto, MemoryType } from "../dto/create-memory.dto";
import { SearchMemoryDto } from "../dto/search-memory.dto";
import { Memory } from "../entities/memory.entity";

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------
const mockMemoryRepository = {
  createMemory: jest.fn(),
  findMemoryById: jest.fn(),
  findUserMemories: jest.fn(),
  searchMemoryMetadata: jest.fn(),
  updateMemory: jest.fn(),
  deleteMemory: jest.fn(),
};

function createMockMemory(overrides: Partial<Memory> = {}): Memory {
  const memory = {
    memory_id: 1,
    user_id: 123,
    content: "Reflected on my career goals today.",
    memory_type: MemoryType.JOURNAL,
    title: "Career reflection",
    importance_score: 0.85,
    embedding_id: null,
    created_at: new Date(),
    updated_at: new Date(),
    metadata: null,
    contextInfo: null,
    ...overrides,
  } as any;
  return memory;
}

describe("MemoryService", () => {
  let service: MemoryService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MemoryService,
        { provide: MemoryRepository, useValue: mockMemoryRepository },
      ],
    }).compile();

    service = module.get<MemoryService>(MemoryService);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("create", () => {
    it("should create a memory via the repository", async () => {
      const dto = {
        content: "New memory",
        type: MemoryType.INSIGHT,
      } as CreateMemoryDto;
      const created = createMockMemory();
      mockMemoryRepository.createMemory.mockResolvedValue(created);

      const result = await service.create(123, dto);
      expect(mockMemoryRepository.createMemory).toHaveBeenCalledWith(123, dto);
      expect(result).toEqual(created);
    });

    it("should propagate repository errors", async () => {
      mockMemoryRepository.createMemory.mockRejectedValue(
        new Error("DB error"),
      );
      await expect(service.create(123, {} as CreateMemoryDto)).rejects.toThrow(
        "DB error",
      );
    });
  });

  describe("findAll", () => {
    it("should return paginated memories", async () => {
      const paginated = {
        data: [createMockMemory()],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      };
      mockMemoryRepository.findUserMemories.mockResolvedValue(paginated);

      const result = await service.findAll(123, { page: 1, limit: 10 });
      expect(mockMemoryRepository.findUserMemories).toHaveBeenCalledWith(123, {
        page: 1,
        limit: 10,
      });
      expect(result).toEqual(paginated);
    });
  });

  describe("search", () => {
    it("should delegate search to the repository", async () => {
      const searchDto: SearchMemoryDto = {
        query: "career",
        type: MemoryType.JOURNAL,
      };
      const paginated = {
        data: [createMockMemory()],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      };
      mockMemoryRepository.searchMemoryMetadata.mockResolvedValue(paginated);

      const result = await service.search(123, searchDto, {
        page: 1,
        limit: 10,
      });
      expect(mockMemoryRepository.searchMemoryMetadata).toHaveBeenCalledWith(
        123,
        searchDto,
        { page: 1, limit: 10 },
      );
      expect(result).toEqual(paginated);
    });
  });

  describe("findOne", () => {
    it("should return a memory owned by the user", async () => {
      const memory = createMockMemory({ user_id: 123 });
      mockMemoryRepository.findMemoryById.mockResolvedValue(memory);

      const result = await service.findOne(1, 123);
      expect(result).toEqual(memory);
    });

    it("should throw NotFoundException when memory missing", async () => {
      mockMemoryRepository.findMemoryById.mockResolvedValue(null);
      await expect(service.findOne(1, 123)).rejects.toThrow(NotFoundException);
    });

    it("should throw ForbiddenException for non-owner", async () => {
      mockMemoryRepository.findMemoryById.mockResolvedValue(
        createMockMemory({ user_id: 999 }),
      );
      await expect(service.findOne(1, 123)).rejects.toThrow(ForbiddenException);
    });
  });

  describe("update", () => {
    it("should allow owner to update a memory", async () => {
      const memory = createMockMemory({ user_id: 123 });
      const updated = createMockMemory({ content: "Updated" });
      mockMemoryRepository.findMemoryById.mockResolvedValue(memory);
      mockMemoryRepository.updateMemory.mockResolvedValue(updated);

      const result = await service.update(1, 123, { content: "Updated" });
      expect(result).toEqual(updated);
    });

    it("should throw ForbiddenException for non-owner", async () => {
      mockMemoryRepository.findMemoryById.mockResolvedValue(
        createMockMemory({ user_id: 999 }),
      );
      await expect(
        service.update(1, 123, { content: "Updated" }),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe("remove", () => {
    it("should allow owner to delete a memory", async () => {
      const memory = createMockMemory({ user_id: 123 });
      mockMemoryRepository.findMemoryById.mockResolvedValue(memory);
      mockMemoryRepository.deleteMemory.mockResolvedValue(memory);

      const result = await service.remove(1, 123);
      expect(result).toEqual(memory);
    });

    it("should throw NotFoundException when memory missing", async () => {
      mockMemoryRepository.findMemoryById.mockResolvedValue(null);
      await expect(service.remove(1, 123)).rejects.toThrow(NotFoundException);
    });
  });
});
