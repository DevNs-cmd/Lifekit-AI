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
    userId: number,
    data: {
      category: string;
      title: string;
      description: string;
      relevanceScore?: number;
      metadata?: any;
    },
  ): Promise<Recommendation> {
    try {
      const serializedDescription = JSON.stringify({
        text: data.description,
        metadata: data.metadata ?? {},
      });

      const opportunity = await this.prisma.opportunities.create({
        data: {
          user_id: userId,
          category: data.category,
          title: data.title,
          description: serializedDescription,
          match_score: data.relevanceScore ?? null,
          status: RecommendationStatus.PENDING,
        },
      });

      return mapPrismaOpportunityToRecommendation(opportunity);
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async findUserRecommendations(
    userId: number,
    filters?: { category?: string; status?: RecommendationStatus },
    pagination?: PaginationParams,
  ): Promise<PaginatedResult<Recommendation>> {
    try {
      const where: any = { user_id: userId };

      if (filters?.category) {
        where.category = filters.category;
      }
      if (filters?.status) {
        where.status = filters.status;
      }

      const page = pagination?.page ?? 1;
      const limit = Math.min(pagination?.limit ?? 10, 100);
      const skip = (page - 1) * limit;

      const [data, total] = await this.prisma.$transaction([
        this.prisma.opportunities.findMany({
          where,
          skip,
          take: limit,
          orderBy: { created_at: "desc" },
        }),
        this.prisma.opportunities.count({ where }),
      ]);

      return {
        data: data.map((o) => mapPrismaOpportunityToRecommendation(o)),
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
    id: number,
    status: RecommendationStatus,
  ): Promise<Recommendation> {
    try {
      const opportunity = await this.prisma.opportunities.update({
        where: { opportunity_id: id },
        data: { status },
      });
      return mapPrismaOpportunityToRecommendation(opportunity);
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async findRecommendationById(id: number): Promise<Recommendation | null> {
    try {
      const opportunity = await this.prisma.opportunities.findUnique({
        where: { opportunity_id: id },
      });
      if (!opportunity) return null;
      return mapPrismaOpportunityToRecommendation(opportunity);
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async deleteRecommendation(id: number): Promise<Recommendation> {
    try {
      const opportunity = await this.prisma.opportunities.findUnique({
        where: { opportunity_id: id },
      });
      if (opportunity) {
        await this.prisma.opportunities.delete({
          where: { opportunity_id: id },
        });
      }
      return mapPrismaOpportunityToRecommendation(opportunity!)!;
    } catch (error) {
      handlePrismaError(error);
    }
  }
}

function mapPrismaOpportunityToRecommendation(o: any): Recommendation {
  if (!o) return null as any;

  let text = o.description;
  let metadata = {};

  try {
    const parsed = JSON.parse(o.description || "{}");
    text = parsed.text ?? o.description;
    metadata = parsed.metadata ?? {};
  } catch {
    // legacy text
  }

  return {
    opportunity_id: o.opportunity_id,
    user_id: o.user_id,
    category: o.category,
    title: o.title,
    description: text,
    relevanceScore: o.match_score ? parseFloat(o.match_score.toString()) : null,
    status: o.status as RecommendationStatus,
    created_at: o.created_at,
    updated_at: o.updated_at,
    metadata,
  } as unknown as Recommendation;
}
