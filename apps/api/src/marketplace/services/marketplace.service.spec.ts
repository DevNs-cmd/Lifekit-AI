import { NotFoundException, ForbiddenException } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { MarketplaceService } from "./marketplace.service";
import { MarketplaceRepository } from "../repositories/marketplace.repository";
import { CreateListingDto } from "../dto/create-listing.dto";
import { SearchListingDto } from "../dto/search-listing.dto";
import { MarketplaceListing } from "../entities/marketplace-listing.entity";
import { AppConfigService } from "../../config/app-config.service";
import { PrismaService } from "../../prisma/prisma.service";

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------
const mockMarketplaceRepository = {
  createListing: jest.fn(),
  findListingById: jest.fn(),
  searchListings: jest.fn(),
  updateListing: jest.fn(),
  deleteListing: jest.fn(),
};

function createMockListing(
  overrides: Partial<MarketplaceListing> = {},
): MarketplaceListing {
  const listing = {
    service_id: 1,
    service_name: "Productivity Blueprint Course",
    provider_name: "LifeKit Provider",
    category: "Templates",
    description: "A complete guide to mastering time management.",
    price: 19.99,
    rating: 4.8,
    image_url: null,
    created_at: new Date(),
    userId: "123",
    tags: ["productivity"],
    isFree: false,
    stock: null,
    isAvailable: true,
    ...overrides,
  } as any;
  return listing;
}

describe("MarketplaceService", () => {
  let service: MarketplaceService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MarketplaceService,
        {
          provide: MarketplaceRepository,
          useValue: mockMarketplaceRepository,
        },
        {
          provide: AppConfigService,
          useValue: { aiServiceUrl: "http://localhost:8000" },
        },
        {
          provide: PrismaService,
          useValue: { marketplace: { count: jest.fn().mockResolvedValue(10) } },
        },
      ],
    }).compile();

    service = module.get<MarketplaceService>(MarketplaceService);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("create", () => {
    it("should create a listing via the repository", async () => {
      const dto = {
        title: "New Listing",
        description: "A description",
        category: "Templates",
        tags: ["productivity"],
        price: 9.99,
        isFree: false,
        availability: { isAvailable: true },
      } as CreateListingDto;
      const created = createMockListing();
      mockMarketplaceRepository.createListing.mockResolvedValue(created);

      const result = await service.create(123, dto);
      expect(mockMarketplaceRepository.createListing).toHaveBeenCalledWith(
        123,
        dto,
      );
      expect(result).toEqual(created);
    });

    it("should propagate repository errors", async () => {
      mockMarketplaceRepository.createListing.mockRejectedValue(
        new Error("DB error"),
      );
      await expect(service.create(123, {} as CreateListingDto)).rejects.toThrow(
        "DB error",
      );
    });
  });

  describe("findAll", () => {
    it("should return paginated listings", async () => {
      const filters: SearchListingDto & { isAvailable?: boolean } = {
        category: "Templates",
      };
      const paginated = {
        data: [createMockListing()],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      };
      mockMarketplaceRepository.searchListings.mockResolvedValue(paginated);

      const result = await service.findAll(1, filters, { page: 1, limit: 10 });
      expect(mockMarketplaceRepository.searchListings).toHaveBeenCalledWith(
        filters,
        { page: 1, limit: 10 },
      );
      expect(result).toEqual(paginated);
    });
  });

  describe("findOne", () => {
    it("should return a listing", async () => {
      const listing = createMockListing();
      mockMarketplaceRepository.findListingById.mockResolvedValue(listing);

      const result = await service.findOne(1);
      expect(result).toEqual(listing);
    });

    it("should throw NotFoundException when listing missing", async () => {
      mockMarketplaceRepository.findListingById.mockResolvedValue(null);
      await expect(service.findOne(1)).rejects.toThrow(NotFoundException);
    });
  });

  describe("update", () => {
    it("should allow owner to update a listing", async () => {
      const listing = createMockListing({ userId: "123" });
      const updated = createMockListing({ service_name: "Updated" });
      mockMarketplaceRepository.findListingById.mockResolvedValue(listing);
      mockMarketplaceRepository.updateListing.mockResolvedValue(updated);

      const result = await service.update(1, 123, { title: "Updated" });
      expect(result).toEqual(updated);
    });

    it("should throw ForbiddenException for non-owner", async () => {
      const listing = createMockListing({ userId: "999" });
      mockMarketplaceRepository.findListingById.mockResolvedValue(listing);
      await expect(
        service.update(1, 123, { title: "Updated" }),
      ).rejects.toThrow(ForbiddenException);
    });

    it("should throw NotFoundException when listing missing", async () => {
      mockMarketplaceRepository.findListingById.mockResolvedValue(null);
      await expect(
        service.update(1, 123, { title: "Updated" }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe("remove", () => {
    it("should allow owner to delete a listing", async () => {
      const listing = createMockListing({ userId: "123" });
      mockMarketplaceRepository.findListingById.mockResolvedValue(listing);
      mockMarketplaceRepository.deleteListing.mockResolvedValue(listing);

      const result = await service.remove(1, 123);
      expect(result).toEqual(listing);
    });

    it("should throw ForbiddenException for non-owner", async () => {
      const listing = createMockListing({ userId: "999" });
      mockMarketplaceRepository.findListingById.mockResolvedValue(listing);
      await expect(service.remove(1, 123)).rejects.toThrow(ForbiddenException);
    });
  });
});
