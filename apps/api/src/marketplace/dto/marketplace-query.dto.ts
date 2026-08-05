import { ApiPropertyOptional } from "@nestjs/swagger";
import { Transform, Type } from "class-transformer";
import {
  IsArray,
  IsBoolean,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from "class-validator";

export class MarketplaceQueryDto {
  @ApiPropertyOptional({
    description: "Text search query matching titles or descriptions",
    example: "Notion",
  })
  @IsString()
  @IsOptional()
  query?: string;

  @ApiPropertyOptional({
    description: "Category filter",
    example: "Templates",
  })
  @IsString()
  @IsOptional()
  category?: string;

  @ApiPropertyOptional({
    description: "Tags filter",
    example: ["productivity"],
  })
  @Transform(({ value }) => {
    if (typeof value === "string") {
      return value.includes(",") ? value.split(",") : [value];
    }
    return value;
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @ApiPropertyOptional({ description: "Minimum price filter", example: 5.0 })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @IsOptional()
  minPrice?: number;

  @ApiPropertyOptional({ description: "Maximum price filter", example: 50.0 })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @IsOptional()
  maxPrice?: number;

  @ApiPropertyOptional({
    description: "Filter by availability",
    example: true,
  })
  @Transform(({ value }) => {
    if (typeof value === "string") {
      return value === "true";
    }
    return value;
  })
  @IsBoolean()
  @IsOptional()
  isAvailable?: boolean;

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
