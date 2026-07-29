import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsObject, IsOptional, IsString, ValidateNested } from 'class-validator';
import { RecommendationPreferenceDto } from './recommendation-preference.dto';

export class RecommendationRequestDto {
  @ApiProperty({ description: 'Category context for recommendations (e.g. HABITS, COURSES, BOOKS)', example: 'HABITS' })
  @IsString()
  @IsNotEmpty({ message: 'Category is required' })
  category!: string;

  @ApiProperty({ description: 'Specific preference profile to guide recommendations', type: () => RecommendationPreferenceDto })
  @ValidateNested()
  @Type(() => RecommendationPreferenceDto)
  preferences!: RecommendationPreferenceDto;

  @ApiPropertyOptional({ description: 'Additional structured filters', example: { location: 'remote', language: 'en' } })
  @IsObject()
  @IsOptional()
  filters?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Optional text describing user situation or context', example: 'Feeling a bit burnt out from work, looking for short relaxation exercises.' })
  @IsString()
  @IsOptional()
  context?: string;
}
