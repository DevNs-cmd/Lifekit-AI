import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  ArrayNotEmpty,
  IsArray,
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
} from "class-validator";

export class CreateLifeMissionDto {
  @ApiProperty({
    description: "The title of the life mission",
    example: "Achieve Financial Independence",
  })
  @IsString()
  @IsNotEmpty({ message: "Title is required" })
  title!: string;

  @ApiProperty({
    description: "A detailed description of what the life mission is",
    example:
      "Build savings and passive income streams to retire early by age 40.",
  })
  @IsString()
  @IsNotEmpty({ message: "Description is required" })
  description!: string;

  @ApiProperty({
    description:
      "List of specific objectives and user goals this mission addresses",
    example: ["Save 1M USD", "Invest in real estate"],
  })
  @IsArray()
  @IsString({ each: true })
  @ArrayNotEmpty({ message: "Goals list cannot be empty" })
  goals!: string[];

  @ApiProperty({
    description: "Underlying core values associated with this mission",
    example: ["Freedom", "Security", "Discipline"],
  })
  @IsArray()
  @IsString({ each: true })
  @ArrayNotEmpty({ message: "Values list cannot be empty" })
  values!: string[];

  @ApiProperty({
    description: "Long term goals and milestones to reach this mission",
    example: ["Max out 401k annually", "Acquire 3 rental properties"],
  })
  @IsArray()
  @IsString({ each: true })
  @ArrayNotEmpty({ message: "Long-term objectives cannot be empty" })
  longTermObjectives!: string[];

  @ApiPropertyOptional({
    description: "Any constraints or limitations (e.g. budget, time)",
    example: ["Maximum of 20 hours per week of study", "Initial capital limit"],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  constraints?: string[];

  @ApiProperty({
    description: "Start date of the mission lifecycle",
    example: "2026-08-01T00:00:00.000Z",
  })
  @IsDateString({}, { message: "Start date must be a valid ISO date string" })
  startDate!: string;

  @ApiProperty({
    description: "Target date to accomplish the mission",
    example: "2035-12-31T00:00:00.000Z",
  })
  @IsDateString({}, { message: "Target date must be a valid ISO date string" })
  targetDate!: string;

  @ApiPropertyOptional({
    description: "The category classification of the life mission",
    example: "career",
  })
  @IsString()
  @IsOptional()
  category?: string;
}
