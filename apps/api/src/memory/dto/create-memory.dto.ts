import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsObject, IsOptional, IsString } from 'class-validator';

export enum MemoryType {
  JOURNAL = 'JOURNAL',
  EVENT = 'EVENT',
  INSIGHT = 'INSIGHT',
  DOCUMENT = 'DOCUMENT',
  CONVERSATION = 'CONVERSATION',
}

export class CreateMemoryDto {
  @ApiProperty({ description: 'The main textual content of the memory entry', example: 'Reflected on my career goals today and realized I want to pivot towards AI research.' })
  @IsString()
  @IsNotEmpty({ message: 'Content is required' })
  content!: string;

  @ApiProperty({ description: 'The classification category of this memory', enum: MemoryType, example: MemoryType.JOURNAL })
  @IsEnum(MemoryType, { message: 'type must be a valid MemoryType' })
  type!: MemoryType;

  @ApiPropertyOptional({ description: 'Additional structured metadata fields associated with this memory', example: { location: 'home', mood: 'thoughtful' } })
  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Optional background context information or tags describing the entry environment', example: 'Written after reading a paper on transformer models.' })
  @IsString()
  @IsOptional()
  contextInfo?: string;
}
