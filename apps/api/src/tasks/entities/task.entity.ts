import { ApiProperty } from "@nestjs/swagger";
import { TaskStatus } from "../dto/create-task.dto";
import { PriorityLevel } from "../../common/enums";

export class Task {
  @ApiProperty({
    description: "Unique identifier for the task",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  id!: string;

  @ApiProperty({
    description: "Associated User ID",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  userId!: string;

  @ApiProperty({
    description: "Associated Plan ID",
    example: "123e4567-e89b-12d3-a456-426614174000",
    required: false,
  })
  planId?: string | null;

  @ApiProperty({
    description: "The title of the task",
    example: "Buy new running shoes",
  })
  title!: string;

  @ApiProperty({
    description: "A detailed description of the task requirements",
    required: false,
    example: "Ensure shoes are suitable for road running.",
  })
  description?: string | null;

  @ApiProperty({
    description: "Current completion status of the task",
    enum: TaskStatus,
    example: TaskStatus.PENDING,
  })
  status!: TaskStatus;

  @ApiProperty({
    description: "Task priority level",
    enum: PriorityLevel,
    example: PriorityLevel.MEDIUM,
  })
  priority!: PriorityLevel;

  @ApiProperty({
    description: "Task due date and time",
    example: "2026-08-05T18:00:00.000Z",
  })
  dueDate!: Date;

  @ApiProperty({
    description: "The individual or agent assigned to complete this task",
    required: false,
    example: "User",
  })
  assignment?: string | null;

  @ApiProperty({
    description: "Creation date",
    example: "2026-07-28T12:00:00Z",
  })
  createdAt!: Date;

  @ApiProperty({
    description: "Last update date",
    example: "2026-07-28T12:00:00Z",
  })
  updatedAt!: Date;
}
