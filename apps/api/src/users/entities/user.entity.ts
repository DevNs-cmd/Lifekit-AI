import { ApiProperty } from '@nestjs/swagger';
import { UserPreference } from './user-preference.entity';

export class User {
  @ApiProperty({ description: 'Unique identifier for the user', example: '123e4567-e89b-12d3-a456-426614174000' })
  id!: string;

  @ApiProperty({ description: 'Email address of the user', example: 'user@example.com' })
  email!: string;

  @ApiProperty({ description: 'Full name of the user', example: 'John Doe' })
  fullName!: string;

  @ApiProperty({ description: 'Hashed password of the user' })
  passwordHash!: string;

  @ApiProperty({ description: 'User preferences profile', type: () => UserPreference, required: false })
  preference?: UserPreference | null;

  @ApiProperty({ description: 'Phone number of the user', example: '+1234567890', required: false })
  phone?: string | null;

  @ApiProperty({ description: 'Date of birth of the user', example: '1990-01-01', required: false })
  dateOfBirth?: Date | string | null;

  @ApiProperty({ description: 'Profession of the user', example: 'Software Engineer', required: false })
  profession?: string | null;

  @ApiProperty({ description: 'Profile photo URL of the user', example: 'https://example.com/photo.jpg', required: false })
  profilePhoto?: string | null;

  @ApiProperty({ description: 'Creation date', example: '2026-07-28T12:00:00Z' })
  createdAt!: Date;

  @ApiProperty({ description: 'Last update date', example: '2026-07-28T12:00:00Z' })
  updatedAt!: Date;
}
