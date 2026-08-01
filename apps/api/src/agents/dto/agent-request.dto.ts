import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsEnum,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
} from "class-validator";

export enum AgentType {
  PLANNER = "PLANNER",
  COACH = "COACH",
  ANALYST = "ANALYST",
  WRITER = "WRITER",
  GUARDIAN = "GUARDIAN",
}

export class AgentRequestDto {
  @ApiProperty({
    description: "The type of AI agent to delegate the work to",
    enum: AgentType,
    example: AgentType.COACH,
  })
  @IsEnum(AgentType, { message: "agentType must be a valid AgentType" })
  agentType!: AgentType;

  @ApiProperty({
    description: "The raw query or instruction string for the agent",
    example: "Help me evaluate my daily workout routine",
  })
  @IsString()
  @IsNotEmpty({ message: "userInput is required" })
  userInput!: string;

  @ApiPropertyOptional({
    description: "Contextual key-value dataset relevant to agent operations",
    example: { lastActive: "2026-07-28", age: 30 },
  })
  @IsObject()
  @IsOptional()
  contextData?: Record<string, any>;

  @ApiPropertyOptional({
    description: "Optional configurations defining execution behaviors",
    example: { temperature: 0.7, maxTokens: 2000 },
  })
  @IsObject()
  @IsOptional()
  executionParameters?: Record<string, any>;
}
