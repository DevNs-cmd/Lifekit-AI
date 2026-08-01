import { ApiProperty } from '@nestjs/swagger';

export class MarketplaceListing {
  @ApiProperty({ description: 'Unique identifier for the listing', example: '123e4567-e89b-12d3-a456-426614174000' })
  id!: string;

  @ApiProperty({ description: 'Associated User ID (creator)', example: '123e4567-e89b-12d3-a456-426614174000' })
  userId!: string;

  @ApiProperty({ description: 'Title of the listing', example: 'Productivity Blueprint Course' })
  title!: string;

  @ApiProperty({ description: 'Description of the listing', example: 'A complete guide to mastering time management and daily schedules.' })
  description!: string;

  @ApiProperty({ description: 'The category classification of the item', example: 'Templates' })
  category!: string;

  @ApiProperty({ description: 'Taxonomy tags describing the content', example: ['productivity', 'notion', 'habits'] })
  tags!: string[];

  @ApiProperty({ description: 'Cost price of the listing', example: 19.99 })
  price!: number;

  @ApiProperty({ description: 'Indicates if the item is free of charge', example: false })
  isFree!: boolean;

  @ApiProperty({ description: 'The number of units available for purchase (null implies unlimited)', required: false, example: 10 })
  stock?: number | null;

  @ApiProperty({ description: 'Flag indicating if the listing is active and available', example: true })
  isAvailable!: boolean;

  @ApiProperty({ description: 'Creation date', example: '2026-07-28T12:00:00Z' })
  createdAt!: Date;

  @ApiProperty({ description: 'Last update date', example: '2026-07-28T12:00:00Z' })
  updatedAt!: Date;
}
