import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from "class-validator";
import { UserPreferencesDto } from "./user-preferences.dto";

export class CreateUserDto {
  @ApiProperty({
    description: "The email address of the user",
    example: "user@example.com",
  })
  @IsEmail({}, { message: "Please provide a valid email address" })
  email!: string;

  @ApiProperty({
    description: "The full name of the user",
    example: "John Doe",
  })
  @IsString()
  @IsNotEmpty({ message: "Full name is required" })
  fullName!: string;

  @ApiPropertyOptional({
    description: "The preferences profile of the user",
    type: () => UserPreferencesDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => UserPreferencesDto)
  preferences?: UserPreferencesDto;
}
