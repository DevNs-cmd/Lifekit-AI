import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsNumber,
  Min,
  Max,
  MinLength,
} from "class-validator";

export class CreateOpportunityDto {
  @ApiProperty({
    description: "Title of the opportunity",
    example: "Google SWE Internship 2026",
  })
  @IsString()
  @IsNotEmpty({ message: "Title is required" })
  @MinLength(3, { message: "Title must be at least 3 characters" })
  title!: string;

  @ApiPropertyOptional({ description: "Full description of the opportunity" })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ description: "Category", example: "career" })
  @IsString()
  @IsOptional()
  category?: string;

  @ApiPropertyOptional({
    description: "External URL",
    example: "https://careers.google.com",
  })
  @IsString()
  @IsOptional()
  source_url?: string;

  @ApiPropertyOptional({ description: "AI match score 0–100", example: 85 })
  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  match_score?: number;
}
