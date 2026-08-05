import { ApiProperty } from "@nestjs/swagger";
import { PriorityLevel, MissionStatus } from "../../common/enums";

export class LifeMission {
  @ApiProperty({
    description: "Unique identifier for the life mission",
    example: 1,
  })
  mission_id!: number;

  @ApiProperty({
    description: "Associated User ID",
    example: 1,
  })
  user_id!: number;

  @ApiProperty({
    description: "Title of the life mission",
    example: "Achieve Financial Independence",
  })
  title!: string;

  @ApiProperty({
    description: "Detailed description of the life mission",
    example:
      "Build savings and passive income streams to retire early by age 40.",
    required: false,
  })
  description?: string | null;

  @ApiProperty({
    description: "Category of the life mission",
    example: "Financial",
    required: false,
  })
  category?: string | null;

  @ApiProperty({
    description: "Priority level of the mission",
    enum: PriorityLevel,
    example: PriorityLevel.MEDIUM,
    required: false,
  })
  priority?: PriorityLevel | null;

  @ApiProperty({
    description: "Status of the mission",
    enum: MissionStatus,
    example: MissionStatus.ACTIVE,
    required: false,
  })
  status?: MissionStatus | null;

  @ApiProperty({
    description: "Completion progress percentage",
    example: 45,
    required: false,
  })
  progress?: number | null;

  @ApiProperty({
    description: "Flag indicating if the mission is archived",
    example: false,
  })
  isArchived!: boolean;

  @ApiProperty({
    description: "Timestamp when the mission was archived",
    required: false,
  })
  archivedAt?: Date | null;

  @ApiProperty({
    description: "Start date of the mission",
    example: "2026-08-01T00:00:00.000Z",
    required: false,
  })
  start_date?: Date | null;

  @ApiProperty({
    description: "Target date to accomplish the mission",
    example: "2035-12-31T00:00:00.000Z",
    required: false,
  })
  target_date?: Date | null;

  @ApiProperty({
    description: "Creation date",
    example: "2026-07-28T12:00:00Z",
    required: false,
  })
  created_at?: Date | null;

  @ApiProperty({
    description: "Last update date",
    example: "2026-07-28T12:00:00Z",
    required: false,
  })
  updated_at?: Date | null;

  // Compatibility getter aliases
  get id(): number {
    return this.mission_id;
  }

  get userId(): number {
    return this.user_id;
  }

  get startDate(): Date | null {
    return this.start_date ?? null;
  }

  get targetDate(): Date | null {
    return this.target_date ?? null;
  }
}
