import { ApiProperty } from "@nestjs/swagger";

export class MarketplaceListing {
  @ApiProperty({
    description: "Unique identifier for the listing",
    example: 1,
  })
  service_id!: number;

  @ApiProperty({
    description: "Title of the listing",
    example: "Productivity Blueprint Course",
  })
  service_name!: string;

  @ApiProperty({
    description: "The name of the service provider",
    required: false,
    example: "LifeKit Experts",
  })
  provider_name?: string | null;

  @ApiProperty({
    description: "The category classification of the item",
    required: false,
    example: "Templates",
  })
  category?: string | null;

  @ApiProperty({
    description: "Description of the listing",
    required: false,
    example:
      "A complete guide to mastering time management and daily schedules.",
  })
  description?: string | null;

  @ApiProperty({
    description: "Cost price of the listing",
    required: false,
    example: 19.99,
  })
  price?: number | null;

  @ApiProperty({
    description: "Rating score (0.0 to 5.0)",
    required: false,
    example: 4.8,
  })
  rating?: number | null;

  @ApiProperty({
    description: "Image URL for the service item",
    required: false,
  })
  image_url?: string | null;

  @ApiProperty({
    description: "Creation date",
    example: "2026-07-28T12:00:00Z",
  })
  created_at!: Date;

  // Compatibility virtual properties and getters
  userId?: string | null;
  tags?: string[];
  isFree?: boolean;
  stock?: number | null;
  isAvailable?: boolean;

  get id(): number {
    return this.service_id;
  }

  get title(): string {
    return this.service_name;
  }
}
