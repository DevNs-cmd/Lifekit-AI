import { ApiProperty } from '@nestjs/swagger';

export class UserPreference {
  @ApiProperty({ description: 'Unique identifier for the user preference', example: '123e4567-e89b-12d3-a456-426614174000' })
  id!: string;

  @ApiProperty({ description: 'Associated User ID', example: '123e4567-e89b-12d3-a456-426614174000' })
  userId!: string;

  @ApiProperty({ description: 'UI Theme preference', example: 'dark', required: false })
  theme?: string | null;

  @ApiProperty({ description: 'Flag to enable notifications', example: true })
  notificationsEnabled!: boolean;

  @ApiProperty({ description: 'List of user goals', example: ['Learn NestJS'] })
  goals!: string[];

  @ApiProperty({ description: 'List of user interests', example: ['AI'] })
  interests!: string[];

  @ApiProperty({ description: 'Creation date', example: '2026-07-28T12:00:00Z' })
  createdAt!: Date;

  @ApiProperty({ description: 'Last update date', example: '2026-07-28T12:00:00Z' })
  updatedAt!: Date;
}
