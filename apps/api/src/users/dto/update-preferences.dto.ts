import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsArray, IsBoolean, IsOptional, IsString } from "class-validator";

export class UpdatePreferencesDto {
  @ApiPropertyOptional({ description: "UI Theme preference", example: "dark" })
  @IsString()
  @IsOptional()
  theme?: string;

  @ApiPropertyOptional({
    description: "Flag to enable notifications",
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  notificationsEnabled?: boolean;

  @ApiPropertyOptional({
    description: "List of user goals",
    example: ["Learn NestJS", "Improve fitness"],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  goals?: string[];

  @ApiPropertyOptional({
    description: "List of user interests/topics of study",
    example: ["AI", "Software Engineering"],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  interests?: string[];
}
