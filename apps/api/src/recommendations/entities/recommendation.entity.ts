import { ApiProperty } from '@nestjs/swagger';

export enum RecommendationStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  DISMISSED = 'DISMISSED',
}

export class Recommendation {
  @ApiProperty({ description: 'Unique identifier for the recommendation', example: '123e4567-e89b-12d3-a456-426614174000' })
  id!: string;

  @ApiProperty({ description: 'Associated User ID', example: '123e4567-e89b-12d3-a456-426614174000' })
  userId!: string;

  @ApiProperty({ description: 'Category context for recommendations (e.g. HABITS, COURSES, BOOKS)', example: 'HABITS' })
  category!: string;

  @ApiProperty({ description: 'Title of the recommendation', example: '5-Minute Morning Mindfulness' })
  title!: string;

  @ApiProperty({ description: 'Description of the recommendation', example: 'A quick morning routine to center your thoughts before starting work.' })
  description!: string;

  @ApiProperty({ description: 'AI calculated relevance score of the suggestion', required: false, example: 0.95 })
  relevanceScore?: number | null;

  @ApiProperty({ description: 'Additional structured metadata', required: false })
  metadata?: Record<string, any> | null;

  @ApiProperty({ description: 'Status of the recommendation', enum: RecommendationStatus, example: RecommendationStatus.PENDING })
  status!: RecommendationStatus;

  @ApiProperty({ description: 'Creation date', example: '2026-07-28T12:00:00Z' })
  createdAt!: Date;

  @ApiProperty({ description: 'Last update date', example: '2026-07-28T12:00:00Z' })
  updatedAt!: Date;
}
