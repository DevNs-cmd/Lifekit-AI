import { ApiPropertyOptional } from "@nestjs/swagger";
import { Transform, Type } from "class-transformer";
import {
  IsArray,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Min,
} from "class-validator";
import { MemoryType } from "./create-memory.dto";

export class MemoryQueryDto {
  @ApiPropertyOptional({
    description: "Text search query matching content and descriptions",
    example: "career goals",
  })
  @IsString()
  @IsOptional()
  query?: string;

  @ApiPropertyOptional({
    description: "Memory type filter",
    enum: MemoryType,
    example: MemoryType.JOURNAL,
  })
  @IsEnum(MemoryType)
  @IsOptional()
  type?: MemoryType;

  @ApiPropertyOptional({
    description:
      "Tags or keywords associated with metadata/context to filter memories",
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
