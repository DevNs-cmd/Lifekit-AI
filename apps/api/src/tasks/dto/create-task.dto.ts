import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { PriorityLevel } from '../../common/enums';

export enum TaskStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  BLOCKED = 'BLOCKED',
  CANCELLED = 'CANCELLED',
}

export class CreateTaskDto {
  @ApiPropertyOptional({ description: 'The associated Plan ID', example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsUUID('4', { message: 'planId must be a valid UUID' })
  @IsOptional()
  planId?: string;

  @ApiProperty({ description: 'The title of the task', example: 'Buy new running shoes' })
  @IsString()
  @IsNotEmpty({ message: 'Task title is required' })
  title!: string;

  @ApiPropertyOptional({ description: 'A detailed description of the task requirements', example: 'Ensure shoes are suitable for road running and pronation support.' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'Current completion status of the task', enum: TaskStatus, example: TaskStatus.PENDING })
  @IsEnum(TaskStatus, { message: 'status must be a valid TaskStatus value' })
  status!: TaskStatus;

  @ApiProperty({ description: 'Task priority level', enum: PriorityLevel, example: PriorityLevel.MEDIUM })
  @IsEnum(PriorityLevel, { message: 'priority must be a valid PriorityLevel value' })
  priority!: PriorityLevel;

  @ApiProperty({ description: 'Task due date and time', example: '2026-08-05T18:00:00.000Z' })
  @IsDateString({}, { message: 'dueDate must be a valid ISO date string' })
  dueDate!: string;

  @ApiPropertyOptional({ description: 'The individual or agent assigned to complete this task', example: 'User' })
  @IsString()
  @IsOptional()
  assignment?: string;
}
