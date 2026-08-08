import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
} from "class-validator";

export enum MemoryType {
  JOURNAL = "JOURNAL",
  EVENT = "EVENT",
  INSIGHT = "INSIGHT",
  DOCUMENT = "DOCUMENT",
  CONVERSATION = "CONVERSATION",
  GOAL = "GOAL",
  PREFERENCE = "PREFERENCE",
  DECISION = "DECISION",
  FEEDBACK = "FEEDBACK",
  ACHIEVEMENT = "ACHIEVEMENT",
  CONSTRAINT = "CONSTRAINT",
  CONTEXT = "CONTEXT",
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

  @ApiPropertyOptional({
    description: "The classification category of this memory",
    enum: MemoryType,
    example: MemoryType.JOURNAL,
  })
  @IsEnum(MemoryType, { message: "type must be a valid MemoryType" })
  @IsOptional()
  type?: MemoryType;

  @ApiPropertyOptional({
    description: "The classification category of this memory (alias for type)",
    enum: MemoryType,
  })
  @IsEnum(MemoryType, { message: "memoryType must be a valid MemoryType" })
  @IsOptional()
  memoryType?: MemoryType;

  @ApiPropertyOptional({
    description: "Importance rating score (0.0 to 1.0)",
  })
  @IsNumber()
  @IsOptional()
  importanceScore?: number;

  @ApiPropertyOptional({
    description: "Related mission ID",
  })
  @IsNumber()
  @IsOptional()
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
