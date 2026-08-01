import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsOptional, IsUUID } from 'class-validator';
import { PriorityLevel } from '../../common/enums';
import { TaskStatus } from './create-task.dto';

export class TaskFilterDto {
  @ApiPropertyOptional({ description: 'Filter tasks by completion status', enum: TaskStatus, example: TaskStatus.PENDING })
  @IsEnum(TaskStatus)
  @IsOptional()
  status?: TaskStatus;

  @ApiPropertyOptional({ description: 'Filter tasks by priority level', enum: PriorityLevel, example: PriorityLevel.HIGH })
  @IsEnum(PriorityLevel)
  @IsOptional()
  priority?: PriorityLevel;

  @ApiPropertyOptional({ description: 'Start date filter range', example: '2026-07-28T00:00:00.000Z' })
  @IsDateString()
  @IsOptional()
  dueDateFrom?: string;

  @ApiPropertyOptional({ description: 'End date filter range', example: '2026-08-28T23:59:59.000Z' })
  @IsDateString()
  @IsOptional()
  dueDateTo?: string;

  @ApiPropertyOptional({ description: 'Filter tasks by associated plan ID', example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsUUID('4')
  @IsOptional()
  planId?: string;
}
