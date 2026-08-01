import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString, IsUrl, MinLength } from "class-validator";

export class UpdateProfileDto {
  @ApiPropertyOptional({
    description: "The updated full name of the user",
    example: "Jane Doe",
  })
  @IsString()
  @IsOptional()
  @MinLength(2, { message: "Full name must be at least 2 characters long" })
  fullName?: string;

  @ApiPropertyOptional({
    description: "The avatar URL of the user profile",
    example: "https://example.com/avatar.jpg",
  })
  @IsUrl({}, { message: "Avatar URL must be a valid URL" })
  @IsOptional()
  avatarUrl?: string;
}
