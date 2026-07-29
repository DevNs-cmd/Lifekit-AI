import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class GenerateLifeMissionDto {
  @ApiProperty({ description: 'The prompt text or description from which to generate the mission details using AI', example: 'Generate a personal health transformation mission focusing on daily habits.' })
  @IsString()
  @IsNotEmpty({ message: 'Prompt is required for mission generation' })
  prompt!: string;

  @ApiPropertyOptional({ description: 'An optional list of explicit user goals to pre-seed the AI generator', example: ['Lower cholesterol', 'Run a half marathon'] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  userGoals?: string[];

  @ApiPropertyOptional({ description: 'An optional list of constraints to guide the AI planner', example: ['No gym membership', 'Limit workout duration to 30 mins'] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  constraints?: string[];
}
