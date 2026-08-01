import {
  Recommendation,
  RecommendationStatus,
} from "../entities/recommendation.entity";
import {
  PaginationParams,
  PaginatedResult,
} from "../../common/interfaces/pagination.interface";

export interface IRecommendationRepository {
  createRecommendation(
    userId: string,
    data: {
      category: string;
      title: string;
      description: string;
      relevanceScore?: number;
      metadata?: any;
    },
  ): Promise<Recommendation>;
  findUserRecommendations(
    userId: string,
    filters?: { category?: string; status?: RecommendationStatus },
    pagination?: PaginationParams,
  ): Promise<PaginatedResult<Recommendation>>;
  updateRecommendationStatus(
    id: string,
    status: RecommendationStatus,
  ): Promise<Recommendation>;
  deleteRecommendation(id: string): Promise<Recommendation>;
}
