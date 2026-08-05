import { ApiProperty } from "@nestjs/swagger";
import { PlanningHorizon } from "../dto/create-plan.dto";
import { PriorityLevel } from "../../common/enums";

export class Plan {
  @ApiProperty({
    description: "Unique identifier for the plan",
    example: 1,
  })
  goal_id!: number;

  @ApiProperty({
    description: "Associated User ID",
    example: 1,
  })
  user_id!: number;

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
  created_at!: Date;

  // Compatibility fields
  missionId?: number | null;

  get id(): number {
    return this.goal_id;
  }

  get userId(): number {
    return this.user_id;
  }
}
