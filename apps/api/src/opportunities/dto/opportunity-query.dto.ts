import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsInt, IsOptional, IsString, Min } from "class-validator";

export class OpportunityQueryDto {
  @ApiPropertyOptional({ description: "Text search across title and description", example: "Engineer" })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({ description: "Category filter", example: "career" })
  @IsString()
  @IsOptional()
  category?: string;

  @ApiPropertyOptional({ description: "Status filter", example: "OPEN" })
  @IsString()
  @IsOptional()
  status?: string;

  @ApiPropertyOptional({ description: "Page number (1-indexed)", example: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number;

  @ApiPropertyOptional({ description: "Items per page", example: 20 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  limit?: number;
}
