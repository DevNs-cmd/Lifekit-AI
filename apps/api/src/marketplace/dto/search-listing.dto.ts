import { ApiPropertyOptional } from "@nestjs/swagger";
import { Transform, Type } from "class-transformer";
import { IsArray, IsNumber, IsOptional, IsString, Min } from "class-validator";

export class SearchListingDto {
  @ApiPropertyOptional({
    description: "Text search query matching titles or descriptions",
    example: "Notion",
  })
  @IsString()
  @IsOptional()
  query?: string;

  @ApiPropertyOptional({ description: "Category filter", example: "Templates" })
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
  @IsNumber()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  minPrice?: number;

  @ApiPropertyOptional({ description: "Maximum price filter", example: 50.0 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  maxPrice?: number;
}
