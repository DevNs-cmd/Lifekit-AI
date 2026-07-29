import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsOptional, Min } from 'class-validator';

export class ListingAvailabilityDto {
  @ApiPropertyOptional({ description: 'The number of units available for purchase (unspecified implies unlimited)', example: 10 })
  @IsInt()
  @Min(0)
  @IsOptional()
  stock?: number;

  @ApiProperty({ description: 'Flag indicating if the listing is active and available', example: true })
  @IsBoolean()
  isAvailable!: boolean;
}
