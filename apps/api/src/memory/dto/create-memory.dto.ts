import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Max,
  Min,
} from "class-validator";
import { Type } from "class-transformer";

export enum MemoryType {
  JOURNAL = "JOURNAL",
  EVENT = "EVENT",
  INSIGHT = "INSIGHT",
  DOCUMENT = "DOCUMENT",
  CONVERSATION = "CONVERSATION",
}

export class CreateMemoryDto {
  @ApiProperty({
    description: "The main textual content of the memory entry",
    example:
      "Reflected on my career goals today and realized I want to pivot towards AI research.",
  })
  @IsString()
  @IsNotEmpty({ message: "Content is required" })
  content!: string;

  @ApiProperty({
    description: "The classification category of this memory",
    enum: MemoryType,
    example: MemoryType.JOURNAL,
  })
  @IsEnum(MemoryType, { message: "type must be a valid MemoryType" })
  type!: MemoryType;

  @ApiPropertyOptional({
    description: "Importance score between 0.0 and 1.0",
    example: 0.8,
  })
  @IsNumber()
  @Min(0)
  @Max(1)
  @IsOptional()
  @Type(() => Number)
  importanceScore?: number;

  @ApiPropertyOptional({
    description: "ID of the related life mission",
    example: 42,
  })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  relatedMissionId?: number;

  @ApiPropertyOptional({
    description:
      "Additional structured metadata fields associated with this memory",
    example: { location: "home", mood: "thoughtful" },
  })
  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;

  @ApiPropertyOptional({
    description:
      "Optional background context information or tags describing the entry environment",
    example: "Written after reading a paper on transformer models.",
  })
  @IsString()
  @IsOptional()
  contextInfo?: string;
}
