import { NotFoundException, ForbiddenException } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { RecommendationsService } from "./recommendations.service";
import { RecommendationRepository } from "../repositories/recommendation.repository";
import {
  Recommendation,
  RecommendationStatus,
} from "../entities/recommendation.entity";

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------
const mockRecommendationRepository = {
  createRecommendation: jest.fn(),
  findUserRecommendations: jest.fn(),
  updateRecommendationStatus: jest.fn(),
  findRecommendationById: jest.fn(),
  deleteRecommendation: jest.fn(),
};

function createMockRecommendation(
  overrides: Partial<Recommendation> = {},
): Recommendation {
  const rec = {
    opportunity_id: 1,
    user_id: 123,
    category: "HABITS",
    title: "5-Minute Morning Mindfulness",
    description: "A quick morning routine.",
    relevanceScore: 0.95,
    status: RecommendationStatus.PENDING,
    created_at: new Date(),
    updated_at: new Date(),
    metadata: null,
    ...overrides,
  } as any;
  return rec;
}

describe("RecommendationsService", () => {
  let service: RecommendationsService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RecommendationsService,
        {
          provide: RecommendationRepository,
          useValue: mockRecommendationRepository,
        },
      ],
    }).compile();

    service = module.get<RecommendationsService>(RecommendationsService);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("create", () => {
    it("should create a recommendation via the repository", async () => {
      const data = {
        category: "HABITS",
        title: "Morning Routine",
        description: "desc",
      };
      const created = createMockRecommendation();
      mockRecommendationRepository.createRecommendation.mockResolvedValue(
        created,
      );

      const result = await service.create(123, data);
      expect(
        mockRecommendationRepository.createRecommendation,
      ).toHaveBeenCalledWith(123, data);
      expect(result).toEqual(created);
    });

    it("should propagate repository errors", async () => {
      mockRecommendationRepository.createRecommendation.mockRejectedValue(
        new Error("DB error"),
      );
      await expect(
        service.create(123, {
          category: "HABITS",
          title: "t",
          description: "d",
        }),
      ).rejects.toThrow("DB error");
    });
  });

  describe("findAll", () => {
    it("should return paginated recommendations", async () => {
      const paginated = {
        data: [createMockRecommendation()],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      };
      mockRecommendationRepository.findUserRecommendations.mockResolvedValue(
        paginated,
      );

      const result = await service.findAll(
        123,
        { category: "HABITS" },
        { page: 1, limit: 10 },
      );
      expect(
        mockRecommendationRepository.findUserRecommendations,
      ).toHaveBeenCalledWith(
        123,
        { category: "HABITS" },
        { page: 1, limit: 10 },
      );
      expect(result).toEqual(paginated);
    });
  });

  describe("findOne", () => {
    it("should return a recommendation owned by the user", async () => {
      const rec = createMockRecommendation({ user_id: 123 });
      mockRecommendationRepository.findRecommendationById.mockResolvedValue(
        rec,
      );

      const result = await service.findOne(1, 123);
      expect(result).toEqual(rec);
    });

    it("should throw NotFoundException when recommendation missing", async () => {
      mockRecommendationRepository.findRecommendationById.mockResolvedValue(
        null,
      );
      await expect(service.findOne(1, 123)).rejects.toThrow(NotFoundException);
    });

    it("should throw ForbiddenException for non-owner", async () => {
      mockRecommendationRepository.findRecommendationById.mockResolvedValue(
        createMockRecommendation({ user_id: 999 }),
      );
      await expect(service.findOne(1, 123)).rejects.toThrow(ForbiddenException);
    });
  });

  describe("updateStatus", () => {
    it("should allow owner to update status", async () => {
      const rec = createMockRecommendation({ user_id: 123 });
      const updated = createMockRecommendation({
        status: RecommendationStatus.ACCEPTED,
      });
      mockRecommendationRepository.findRecommendationById.mockResolvedValue(
        rec,
      );
      mockRecommendationRepository.updateRecommendationStatus.mockResolvedValue(
        updated,
      );

      const result = await service.updateStatus(
        1,
        123,
        RecommendationStatus.ACCEPTED,
      );
      expect(result).toEqual(updated);
    });

    it("should throw ForbiddenException for non-owner", async () => {
      mockRecommendationRepository.findRecommendationById.mockResolvedValue(
        createMockRecommendation({ user_id: 999 }),
      );
      await expect(
        service.updateStatus(1, 123, RecommendationStatus.ACCEPTED),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe("remove", () => {
    it("should allow owner to delete a recommendation", async () => {
      const rec = createMockRecommendation({ user_id: 123 });
      mockRecommendationRepository.findRecommendationById.mockResolvedValue(
        rec,
      );
      mockRecommendationRepository.deleteRecommendation.mockResolvedValue(rec);

      const result = await service.remove(1, 123);
      expect(result).toEqual(rec);
    });

    it("should throw NotFoundException when recommendation missing", async () => {
      mockRecommendationRepository.findRecommendationById.mockResolvedValue(
        null,
      );
      await expect(service.remove(1, 123)).rejects.toThrow(NotFoundException);
    });
  });
});
