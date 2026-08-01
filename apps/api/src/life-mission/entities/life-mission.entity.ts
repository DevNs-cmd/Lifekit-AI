import { ApiProperty } from "@nestjs/swagger";

export class LifeMission {
  @ApiProperty({
    description: "Unique identifier for the life mission",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  id!: string;

  @ApiProperty({
    description: "Associated User ID",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  userId!: string;

  @ApiProperty({
    description: "Title of the life mission",
    example: "Achieve Financial Independence",
  })
  title!: string;

  @ApiProperty({
    description: "Detailed description of the life mission",
    example:
      "Build savings and passive income streams to retire early by age 40.",
  })
  description!: string;

  @ApiProperty({
    description: "Specific goals this mission addresses",
    example: ["Save 1M USD"],
  })
  goals!: string[];

  @ApiProperty({
    description: "Underlying core values associated with this mission",
    example: ["Freedom"],
  })
  values!: string[];

  @ApiProperty({
    description: "Long term goals and milestones",
    example: ["Max out 401k annually"],
  })
  longTermObjectives!: string[];

  @ApiProperty({
    description: "Constraints or limitations",
    example: ["Capital limit"],
  })
  constraints!: string[];

  @ApiProperty({
    description: "Start date of the mission lifecycle",
    example: "2026-08-01T00:00:00.000Z",
  })
  startDate!: Date;

  @ApiProperty({
    description: "Target date to accomplish the mission",
    example: "2035-12-31T00:00:00.000Z",
  })
  targetDate!: Date;

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
