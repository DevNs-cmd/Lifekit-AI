import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from "@nestjs/common";
import { RecommendationRepository } from "../repositories/recommendation.repository";
import {
  Recommendation,
  RecommendationStatus,
} from "../entities/recommendation.entity";
import {
  PaginationParams,
  PaginatedResult,
} from "../../common/interfaces/pagination.interface";

@Injectable()
export class RecommendationsService {
  constructor(
    private readonly recommendationRepository: RecommendationRepository,
  ) {}

  async create(
    userId: number,
    data: {
      category: string;
      title: string;
      description: string;
      relevanceScore?: number;
      metadata?: any;
    },
  ): Promise<Recommendation> {
    return this.recommendationRepository.createRecommendation(userId, data);
  }

  async findAll(
    userId: number,
    filters?: { category?: string; status?: RecommendationStatus },
    pagination?: PaginationParams,
  ): Promise<PaginatedResult<Recommendation>> {
    return this.recommendationRepository.findUserRecommendations(
      userId,
      filters,
      pagination,
    );
  }

  async findOne(id: number, userId: number): Promise<Recommendation> {
    const recommendation =
      await this.recommendationRepository.findRecommendationById(id);
    if (!recommendation) {
      throw new NotFoundException("Recommendation not found");
    }
    if (recommendation.user_id !== userId) {
      throw new ForbiddenException(
        "You do not have permission to access this recommendation",
      );
    }
    return recommendation;
  }

  async updateStatus(
    id: number,
    userId: number,
    status: RecommendationStatus,
  ): Promise<Recommendation> {
    await this.findOne(id, userId); // verify ownership
    return this.recommendationRepository.updateRecommendationStatus(id, status);
  }

  async remove(id: number, userId: number): Promise<Recommendation> {
    await this.findOne(id, userId); // verify ownership
    return this.recommendationRepository.deleteRecommendation(id);
  }
}
