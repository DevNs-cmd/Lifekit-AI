import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { IRecommendationRepository } from "./recommendation.repository.interface";
import {
  Recommendation,
  RecommendationStatus,
} from "../entities/recommendation.entity";
import {
  PaginationParams,
  PaginatedResult,
} from "../../common/interfaces/pagination.interface";
import { handlePrismaError } from "../../common/utils/prisma-error.util";

@Injectable()
export class RecommendationRepository implements IRecommendationRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createRecommendation(
    userId: string,
    data: {
      category: string;
      title: string;
      description: string;
      relevanceScore?: number;
      metadata?: any;
    },
  ): Promise<Recommendation> {
    try {
      return (await this.prisma.recommendation.create({
        data: {
          userId,
          category: data.category,
          title: data.title,
          description: data.description,
          relevanceScore: data.relevanceScore ?? null,
          metadata: data.metadata ?? undefined,
        },
      })) as unknown as Recommendation;
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async findUserRecommendations(
    userId: string,
    filters?: { category?: string; status?: RecommendationStatus },
    pagination?: PaginationParams,
  ): Promise<PaginatedResult<Recommendation>> {
    try {
      const where: any = { userId };

      if (filters?.category) {
        where.category = filters.category;
      }
      if (filters?.status) {
        where.status = filters.status;
      }

      const page = pagination?.page ?? 1;
      const limit = pagination?.limit ?? 10;
      const skip = (page - 1) * limit;

      const [data, total] = await this.prisma.$transaction([
        this.prisma.recommendation.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: "desc" },
        }),
        this.prisma.recommendation.count({ where }),
      ]);

      return {
        data: data as unknown as Recommendation[],
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async updateRecommendationStatus(
    id: string,
    status: RecommendationStatus,
  ): Promise<Recommendation> {
    try {
      return (await this.prisma.recommendation.update({
        where: { id },
        data: { status },
      })) as unknown as Recommendation;
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async deleteRecommendation(id: string): Promise<Recommendation> {
    try {
      return (await this.prisma.recommendation.delete({
        where: { id },
      })) as unknown as Recommendation;
    } catch (error) {
      handlePrismaError(error);
    }
  }
}
