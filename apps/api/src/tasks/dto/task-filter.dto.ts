import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsDateString, IsEnum, IsOptional, IsInt, Min } from "class-validator";
import { TaskStatus } from "./create-task.dto";

export class TaskFilterDto {
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
    description: "Filter tasks by associated mission ID",
    example: 1,
  })
  @IsInt()
  @Min(1)
  @IsOptional()
  missionId?: number;
}
