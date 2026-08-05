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
    userId: number,
    data: {
      category: string;
      title: string;
      description: string;
      relevanceScore?: number;
      metadata?: any;
    },
  ): Promise<Recommendation>;
  findUserRecommendations(
    userId: number,
    filters?: { category?: string; status?: RecommendationStatus },
    pagination?: PaginationParams,
  ): Promise<PaginatedResult<Recommendation>>;
  updateRecommendationStatus(
    id: number,
    status: RecommendationStatus,
  ): Promise<Recommendation>;
  findRecommendationById(id: number): Promise<Recommendation | null>;
  deleteRecommendation(id: number): Promise<Recommendation>;
}
