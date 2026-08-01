import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from "class-validator";
import { PlanningHorizon } from "./create-plan.dto";
import { PriorityLevel } from "../../common/enums";

export class GeneratePlanRequestDto {
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
    example: PlanningHorizon.WEEKLY,
  })
  @IsEnum(PlanningHorizon, {
    message: "Planning horizon must be a valid enum value",
  })
  planningHorizon!: PlanningHorizon;

  @ApiPropertyOptional({
    description:
      "List of physical constraints or timing bottlenecks to guide the generator",
    example: ["Max 45 mins workout", "No equipment"],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  userConstraints?: string[];

  @ApiProperty({
    description: "Priority tier of this plan",
    enum: PriorityLevel,
    example: PriorityLevel.MEDIUM,
  })
  @IsEnum(PriorityLevel, {
    message: "Priority level must be a valid enum value",
  })
  priority!: PriorityLevel;
}
