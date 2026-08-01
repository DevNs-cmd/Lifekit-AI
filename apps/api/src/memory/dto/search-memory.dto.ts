import { ApiPropertyOptional } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsArray, IsEnum, IsOptional, IsString } from "class-validator";
import { MemoryType } from "./create-memory.dto";

export class SearchMemoryDto {
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
}
