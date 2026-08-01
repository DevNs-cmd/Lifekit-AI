import { ApiProperty } from "@nestjs/swagger";
import { PlanningHorizon } from "../dto/create-plan.dto";
import { PriorityLevel } from "../../common/enums";

export class Plan {
  @ApiProperty({
    description: "Unique identifier for the plan",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  id!: string;

  @ApiProperty({
    description: "Associated User ID",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  userId!: string;

  @ApiProperty({
    description: "Associated Life Mission ID",
    example: "123e4567-e89b-12d3-a456-426614174000",
    required: false,
  })
  missionId?: string | null;

  @ApiProperty({
    description: "Title of the plan",
    example: "Q3 Physical Health Plan",
  })
  title!: string;

  @ApiProperty({
    description: "Specific goals and inputs to formulate the plan",
    example: "Improve cardiorespiratory endurance and run 5k under 22 minutes",
  })
  goalInput!: string;

  @ApiProperty({
    description: "The timeline scope of the plan",
    enum: PlanningHorizon,
    example: PlanningHorizon.QUARTERLY,
  })
  planningHorizon!: PlanningHorizon;

  @ApiProperty({
    description: "Priority tier of this plan",
    enum: PriorityLevel,
    example: PriorityLevel.HIGH,
  })
  priority!: PriorityLevel;

  @ApiProperty({
    description: "List of physical constraints or timing bottlenecks",
    example: ["Cannot run on Wednesdays"],
  })
  constraints!: string[];

  @ApiProperty({
    description: "List of expected successful outcomes",
    example: ["5k time under 22m"],
  })
  desiredOutcomes!: string[];

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
