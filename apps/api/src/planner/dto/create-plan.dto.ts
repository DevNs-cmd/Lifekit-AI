import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  ArrayNotEmpty,
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsInt,
  Min,
} from "class-validator";
import { PriorityLevel } from "../../common/enums";

export enum PlanningHorizon {
  DAILY = "DAILY",
  WEEKLY = "WEEKLY",
  MONTHLY = "MONTHLY",
  QUARTERLY = "QUARTERLY",
  YEARLY = "YEARLY",
}

export class CreatePlanDto {
  @ApiPropertyOptional({
    description: "The associated Life Mission ID",
    example: 1,
  })
  @IsInt({ message: "missionId must be a valid integer" })
  @Min(1)
  @IsOptional()
  missionId?: number;

  @ApiProperty({
    description: "The title of the plan",
    example: "Q3 Physical Health Plan",
  })
  @IsString()
  @IsNotEmpty({ message: "Plan title is required" })
  title!: string;

  @ApiProperty({
    description: "Specific goals and inputs to formulate the plan",
    example: "Improve cardiorespiratory endurance and run 5k under 22 minutes",
  })
  @IsString()
  @IsNotEmpty({ message: "Goal input is required" })
  goalInput!: string;

  @ApiProperty({
    description: "The timeline scope of the plan",
    enum: PlanningHorizon,
    example: PlanningHorizon.QUARTERLY,
  })
  @IsEnum(PlanningHorizon, {
    message: "Planning horizon must be a valid enum value",
  })
  planningHorizon!: PlanningHorizon;

  @ApiProperty({
    description: "Priority tier of this plan",
    enum: PriorityLevel,
    example: PriorityLevel.HIGH,
  })
  @IsEnum(PriorityLevel, {
    message: "Priority level must be a valid enum value",
  })
  priority!: PriorityLevel;

  @ApiPropertyOptional({
    description: "List of physical constraints or timing bottlenecks",
    example: ["Cannot run on Wednesdays", "No heavy weight lifting"],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  constraints?: string[];

  @ApiProperty({
    description: "List of expected successful outcomes",
    example: ["5k time under 22m", "Resting heart rate below 60bpm"],
  })
  @IsArray()
  @IsString({ each: true })
  @ArrayNotEmpty({ message: "Desired outcomes cannot be empty" })
  desiredOutcomes!: string[];
}
