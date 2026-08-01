import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsArray, IsInt, IsOptional, IsString, Min } from "class-validator";

export class RecommendationPreferenceDto {
  @ApiProperty({
    description: "Key interest topics to scan recommendations for",
    example: ["productivity", "meditation"],
  })
  @IsArray()
  @IsString({ each: true })
  topics!: string[];

  @ApiPropertyOptional({
    description:
      "Difficulty level filter (e.g. BEGINNER, INTERMEDIATE, ADVANCED)",
    example: "INTERMEDIATE",
  })
  @IsString()
  @IsOptional()
  difficultyLevel?: string;

  @ApiPropertyOptional({
    description:
      "Maximum allocated duration for recommended activities in minutes",
    example: 45,
  })
  @IsInt()
  @Min(1)
  @IsOptional()
  maxDurationMinutes?: number;
}
