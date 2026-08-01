import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';
import { IsDateString, IsOptional, IsPhoneNumber, IsString } from 'class-validator';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @ApiPropertyOptional({ description: 'Phone number of the user', example: '+1234567890' })
  @IsPhoneNumber(undefined)
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({ description: 'Date of birth of the user', example: '1990-01-01' })
  @IsDateString()
  @IsOptional()
  dateOfBirth?: string;

  @ApiPropertyOptional({ description: 'Profession of the user', example: 'Software Engineer' })
  @IsString()
  @IsOptional()
  profession?: string;

  @ApiPropertyOptional({ description: 'Profile photo URL of the user', example: 'https://example.com/photo.jpg' })
  @IsString()
  @IsOptional()
  profilePhoto?: string;
}
