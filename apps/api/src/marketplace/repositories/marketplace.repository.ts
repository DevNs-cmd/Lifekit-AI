import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { IMarketplaceRepository } from "./marketplace.repository.interface";
import { CreateListingDto } from "../dto/create-listing.dto";
import { SearchListingDto } from "../dto/search-listing.dto";
import { UpdateListingDto } from "../dto/update-listing.dto";
import { MarketplaceListing } from "../entities/marketplace-listing.entity";
import {
  PaginationParams,
  PaginatedResult,
} from "../../common/interfaces/pagination.interface";
import { handlePrismaError } from "../../common/utils/prisma-error.util";

@Injectable()
export class MarketplaceRepository implements IMarketplaceRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createListing(
    userId: number,
    data: CreateListingDto,
  ): Promise<MarketplaceListing> {
    try {
      const serializedDescription = JSON.stringify({
        text: data.description,
        tags: data.tags ?? [],
        isFree: data.isFree ?? false,
        stock: data.availability?.stock ?? null,
        isAvailable: data.availability?.isAvailable ?? true,
        userId: userId,
      });

      const listing = await this.prisma.marketplace.create({
        data: {
          service_name: data.title,
          provider_name: "LifeKit Provider",
          category: data.category ?? null,
          description: serializedDescription,
          price: data.price,
          rating: null,
          image_url: null,
        },
      });

      return mapPrismaMarketplaceToEntity(listing);
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async findListingById(id: number): Promise<MarketplaceListing | null> {
    try {
      const listing = await this.prisma.marketplace.findUnique({
        where: { service_id: id },
      });
      if (!listing) return null;
      return mapPrismaMarketplaceToEntity(listing);
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async searchListings(
    filters: SearchListingDto & { isAvailable?: boolean },
    pagination?: PaginationParams,
  ): Promise<PaginatedResult<MarketplaceListing>> {
    try {
      const where: any = {};

      if (filters.category) {
        where.category = filters.category;
      }

      if (filters.query) {
        where.OR = [
          { service_name: { contains: filters.query, mode: "insensitive" } },
          { description: { contains: filters.query, mode: "insensitive" } },
        ];
      }

      if (filters.tags && filters.tags.length > 0) {
        where.AND = filters.tags.map((tag) => ({
          description: { contains: tag, mode: "insensitive" },
        }));
      }

      if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
        where.price = {};
        if (filters.minPrice !== undefined) {
          where.price.gte = filters.minPrice;
        }
        if (filters.maxPrice !== undefined) {
          where.price.lte = filters.maxPrice;
        }
      }

      const page = pagination?.page ?? 1;
      const limit = Math.min(pagination?.limit ?? 10, 100);
      const skip = (page - 1) * limit;

      const [data, total] = await this.prisma.$transaction([
        this.prisma.marketplace.findMany({
          where,
          skip,
          take: limit,
          orderBy: { created_at: "desc" },
        }),
        this.prisma.marketplace.count({ where }),
      ]);

      const mappedListings = data.map((m) => mapPrismaMarketplaceToEntity(m));

      // Filter in-memory for availability if requested
      let filtered = mappedListings;
      if (filters.isAvailable !== undefined) {
        filtered = mappedListings.filter(
          (l) => l.isAvailable === filters.isAvailable,
        );
      }

      return {
        data: filtered,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async updateListing(
    id: number,
    data: UpdateListingDto,
  ): Promise<MarketplaceListing> {
    try {
      const existing = await this.prisma.marketplace.findUnique({
        where: { service_id: id },
      });

      if (!existing) {
        throw new Error("Listing not found");
      }

      let text = data.description;
      let tags = data.tags;
      let isFree = data.isFree;
      let stock = data.availability?.stock;
      let isAvailable = data.availability?.isAvailable;
      let originalUserId = null;

      try {
        const parsed = JSON.parse(existing.description || "{}");
        if (text === undefined) text = parsed.text;
        if (tags === undefined) tags = parsed.tags;
        if (isFree === undefined) isFree = parsed.isFree;
        if (stock === undefined) stock = parsed.stock;
        if (isAvailable === undefined) isAvailable = parsed.isAvailable;
        originalUserId = parsed.userId;
      } catch {
        // legacy
      }

      const serializedDescription = JSON.stringify({
        text: text ?? existing.description,
        tags: tags ?? [],
        isFree: isFree ?? false,
        stock: stock ?? null,
        isAvailable: isAvailable ?? true,
        userId: originalUserId,
      });

      const updatePayload: any = {
        description: serializedDescription,
      };

      if (data.title !== undefined) updatePayload.service_name = data.title;
      if (data.category !== undefined) updatePayload.category = data.category;
      if (data.price !== undefined) updatePayload.price = data.price;

      const listing = await this.prisma.marketplace.update({
        where: { service_id: id },
        data: updatePayload,
      });

      return mapPrismaMarketplaceToEntity(listing);
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async deleteListing(id: number): Promise<MarketplaceListing> {
    try {
      const listing = await this.prisma.marketplace.findUnique({
        where: { service_id: id },
      });
      if (listing) {
        await this.prisma.marketplace.delete({
          where: { service_id: id },
        });
      }
      return mapPrismaMarketplaceToEntity(listing!)!;
    } catch (error) {
      handlePrismaError(error);
    }
  }
}

function mapPrismaMarketplaceToEntity(m: any): MarketplaceListing {
  if (!m) return null as any;

  let text = m.description;
  let tags: string[] = [];
  let isFree = false;
  let stock = null;
  let isAvailable = true;
  let userId = null;

  try {
    const parsed = JSON.parse(m.description || "{}");
    text = parsed.text ?? m.description;
    tags = parsed.tags ?? [];
    isFree = parsed.isFree ?? false;
    stock = parsed.stock ?? null;
    isAvailable = parsed.isAvailable ?? true;
    userId = parsed.userId ?? null;
  } catch {
    // legacy text
  }

  return {
    service_id: m.service_id,
    service_name: m.service_name,
    provider_name: m.provider_name,
    category: m.category,
    description: text,
    price: m.price ? parseFloat(m.price.toString()) : null,
    rating: m.rating ? parseFloat(m.rating.toString()) : null,
    image_url: m.image_url,
    created_at: m.created_at,
    userId,
    tags,
    isFree,
    stock,
    isAvailable,
  } as unknown as MarketplaceListing;
}
