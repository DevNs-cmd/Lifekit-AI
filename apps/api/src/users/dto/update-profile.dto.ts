import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsPhoneNumber, IsString, Length } from 'class-validator';

export class UpdateProfileDto {
  @ApiPropertyOptional({ description: 'The full name of the user', example: 'John Doe', minLength: 2, maxLength: 100 })
  @IsString()
  @Length(2, 100, { message: 'Full name must be between 2 and 100 characters' })
  @IsOptional()
  fullName?: string;

  @ApiPropertyOptional({ description: 'The phone number of the user', example: '+1234567890' })
  @IsPhoneNumber(undefined, { message: 'Please provide a valid phone number' })
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({ description: 'The profession of the user', example: 'Software Engineer', minLength: 2, maxLength: 100 })
  @IsString()
  @Length(2, 100, { message: 'Profession must be between 2 and 100 characters' })
  @IsOptional()
  profession?: string;

  @ApiPropertyOptional({ description: 'The profile photo URL of the user', example: 'https://example.com/photo.jpg' })
  @IsString()
  @IsOptional()
  profilePhoto?: string;

  @ApiPropertyOptional({ description: 'The date of birth of the user', example: '1990-01-01' })
  @IsDateString({}, { message: 'Date of birth must be a valid date string (YYYY-MM-DD)' })
  @IsOptional()
  dateOfBirth?: string;
}
