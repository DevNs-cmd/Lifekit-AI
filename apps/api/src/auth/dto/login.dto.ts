import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsString, MinLength } from "class-validator";

export class LoginDto {
  @ApiProperty({
    description: "The email address of the user",
    example: "user@example.com",
  })
  @IsEmail({}, { message: "Please provide a valid email address" })
  email!: string;

  @ApiProperty({
    description: "The password for the user account",
    example: "P@ssword123",
  })
  @IsString()
  @MinLength(1, { message: "Password is required" })
  password!: string;
}
