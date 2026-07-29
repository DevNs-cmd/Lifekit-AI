import { ApiProperty } from '@nestjs/swagger';
import { MemoryType } from '../dto/create-memory.dto';

export class Memory {
  @ApiProperty({ description: 'Unique identifier for the memory entry', example: '123e4567-e89b-12d3-a456-426614174000' })
  id!: string;

  @ApiProperty({ description: 'Associated User ID', example: '123e4567-e89b-12d3-a456-426614174000' })
  userId!: string;

  @ApiProperty({ description: 'The main textual content of the memory entry', example: 'Reflected on my career goals today and realized I want to pivot towards AI research.' })
  content!: string;

  @ApiProperty({ description: 'The classification category of this memory', enum: MemoryType, example: MemoryType.JOURNAL })
  type!: MemoryType;

  @ApiProperty({ description: 'Additional structured metadata fields associated with this memory', required: false })
  metadata?: Record<string, any> | null;

  @ApiProperty({ description: 'Optional background context information or tags describing the entry environment', required: false, example: 'Written after reading a paper on transformer models.' })
  contextInfo?: string | null;

  @ApiProperty({ description: 'Creation date', example: '2026-07-28T12:00:00Z' })
  createdAt!: Date;

  @ApiProperty({ description: 'Last update date', example: '2026-07-28T12:00:00Z' })
  updatedAt!: Date;
}
