import { ApiProperty } from "@nestjs/swagger";
export class Task {
  @ApiProperty({
    description: "Unique identifier for the task",
    example: 1,
  })
  task_id!: number;

  @ApiProperty({
    description: "Associated Mission ID",
    example: 1,
  })
  mission_id!: number;

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
    example: "Pending",
  })
  status!: string;

  @ApiProperty({
    description: "Task priority level",
    example: "Medium",
  })
  priority!: string;

  @ApiProperty({
    description: "Task due date and time",
    example: "2026-08-05T18:00:00.000Z",
    required: false,
  })
  due_date?: Date | null;

  @ApiProperty({
    description: "Estimated time in minutes",
    example: 60,
    required: false,
  })
  estimated_time?: number | null;

  @ApiProperty({
    description: "Completion timestamp",
    required: false,
  })
  completed_at?: Date | null;

  @ApiProperty({
    description: "Creation date",
    example: "2026-07-28T12:00:00Z",
    required: false,
  })
  created_at?: Date | null;

  // Compatibility getters
  get id(): number {
    return this.task_id;
  }

  get missionId(): number {
    return this.mission_id;
  }

  get dueDate(): Date | null {
    return this.due_date ?? null;
  }
}
