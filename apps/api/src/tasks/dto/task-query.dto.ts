import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Min,
} from "class-validator";
import { TaskStatus } from "./create-task.dto";

export class TaskQueryDto {
  @ApiPropertyOptional({
    description: "Parent mission ID",
    example: 1,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  missionId?: number;

  @ApiPropertyOptional({
    description: "Filter tasks by completion status",
    enum: TaskStatus,
    example: TaskStatus.PENDING,
  })
  @IsEnum(TaskStatus)
  @IsOptional()
  status?: TaskStatus;

  @ApiPropertyOptional({
    description: "Filter tasks by priority level",
    example: "Medium",
  })
  @IsString()
  @IsOptional()
  priority?: string;

  @ApiPropertyOptional({
    description: "Start date filter range",
    example: "2026-07-28T00:00:00.000Z",
  })
  @IsDateString()
  @IsOptional()
  dueDateFrom?: string;

  @ApiPropertyOptional({
    description: "End date filter range",
    example: "2026-08-28T23:59:59.000Z",
  })
  @IsDateString()
  @IsOptional()
  dueDateTo?: string;

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
