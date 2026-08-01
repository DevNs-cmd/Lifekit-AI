import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { IMarketplaceRepository } from './marketplace.repository.interface';
import { CreateListingDto } from '../dto/create-listing.dto';
import { SearchListingDto } from '../dto/search-listing.dto';
import { UpdateListingDto } from '../dto/update-listing.dto';
import { MarketplaceListing } from '../entities/marketplace-listing.entity';
import { PaginationParams, PaginatedResult } from '../../common/interfaces/pagination.interface';
import { handlePrismaError } from '../../common/utils/prisma-error.util';

@Injectable()
export class MarketplaceRepository implements IMarketplaceRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createListing(userId: string, data: CreateListingDto): Promise<MarketplaceListing> {
    try {
      return await this.prisma.marketplaceListing.create({
        data: {
          userId,
          title: data.title,
          description: data.description,
          category: data.category,
          tags: data.tags,
          price: data.price,
          isFree: data.isFree,
          stock: data.availability?.stock ?? null,
          isAvailable: data.availability?.isAvailable ?? true,
        },
      });
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async findListingById(id: string): Promise<MarketplaceListing | null> {
    try {
      return await this.prisma.marketplaceListing.findUnique({
        where: { id },
      });
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

      if (filters.isAvailable !== undefined) {
        where.isAvailable = filters.isAvailable;
      }

      if (filters.query) {
        where.OR = [
          { title: { contains: filters.query, mode: 'insensitive' } },
          { description: { contains: filters.query, mode: 'insensitive' } },
        ];
      }

      if (filters.tags && filters.tags.length > 0) {
        where.tags = {
          hasSome: filters.tags,
        };
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
      const limit = pagination?.limit ?? 10;
      const skip = (page - 1) * limit;

      const [data, total] = await this.prisma.$transaction([
        this.prisma.marketplaceListing.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
        }),
        this.prisma.marketplaceListing.count({ where }),
      ]);

      return {
        data,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async updateListing(id: string, data: UpdateListingDto): Promise<MarketplaceListing> {
    try {
      const updateData: any = {};
      if (data.title !== undefined) updateData.title = data.title;
      if (data.description !== undefined) updateData.description = data.description;
      if (data.category !== undefined) updateData.category = data.category;
      if (data.tags !== undefined) updateData.tags = data.tags;
      if (data.price !== undefined) updateData.price = data.price;
      if (data.isFree !== undefined) updateData.isFree = data.isFree;
      if (data.availability !== undefined) {
        if (data.availability.stock !== undefined) updateData.stock = data.availability.stock;
        if (data.availability.isAvailable !== undefined) updateData.isAvailable = data.availability.isAvailable;
      }

      return await this.prisma.marketplaceListing.update({
        where: { id },
        data: updateData,
      });
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async deleteListing(id: string): Promise<MarketplaceListing> {
    try {
      return await this.prisma.marketplaceListing.delete({
        where: { id },
      });
    } catch (error) {
      handlePrismaError(error);
    }
  }
}
