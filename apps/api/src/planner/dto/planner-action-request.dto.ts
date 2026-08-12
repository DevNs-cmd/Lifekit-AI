import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsInt, IsNotEmpty } from "class-validator";
import { Type } from "class-transformer";

export enum PlannerActionType {
  GENERATE = "generate",
  OPTIMISE = "optimise",
  REDUCE = "reduce",
  ACCELERATE = "accelerate",
}

export class PlannerActionRequestDto {
  @ApiProperty({
    description: "Life mission ID to run the planner action against",
    example: 1,
  })
  @Type(() => Number)
  @IsInt()
  missionId!: number;

  @ApiProperty({
    description: "Which planner action to run",
    enum: PlannerActionType,
    example: PlannerActionType.GENERATE,
  })
  @IsEnum(PlannerActionType, { message: "action must be a valid PlannerActionType" })
  @IsNotEmpty()
  action!: PlannerActionType;
}
