import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsEnum, IsInt, IsOptional, IsString, Min } from "class-validator";
import { RecommendationStatus } from "../entities/recommendation.entity";

export class RecommendationFilterDto {
  @ApiPropertyOptional({
    description: "Filter by category",
    example: "HABITS",
  })
  @IsString()
  @IsOptional()
  category?: string;

  @ApiPropertyOptional({
    description: "Filter by status",
    enum: RecommendationStatus,
    example: RecommendationStatus.PENDING,
  })
  @IsEnum(RecommendationStatus)
  @IsOptional()
  status?: RecommendationStatus;

  @ApiPropertyOptional({
    description: "Page number (1-indexed)",
    example: 1,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number;

  @ApiPropertyOptional({
    description: "Number of items per page",
    example: 10,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  limit?: number;
}
