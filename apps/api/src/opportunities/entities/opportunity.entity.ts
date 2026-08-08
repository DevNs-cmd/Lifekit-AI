import { ApiProperty } from "@nestjs/swagger";

export class Opportunity {
  @ApiProperty({ description: "Unique identifier", example: 1 })
  opportunity_id!: number;

  @ApiProperty({ description: "Owner user ID", example: 1 })
  user_id!: number;

  @ApiProperty({ description: "Title of the opportunity", example: "Senior Software Engineer at Google" })
  title!: string;

  @ApiProperty({ description: "Detailed description", required: false })
  description?: string | null;

  @ApiProperty({ description: "Category (career, education, business…)", required: false })
  category?: string | null;

  @ApiProperty({ description: "External URL to apply / learn more", required: false })
  source_url?: string | null;

  @ApiProperty({ description: "Status of the opportunity", example: "OPEN", default: "OPEN" })
  status?: string | null;

  @ApiProperty({ description: "AI match score 0–100", required: false, example: 87.5 })
  match_score?: number | null;

  @ApiProperty({ description: "Creation timestamp" })
  created_at!: Date;

  @ApiProperty({ description: "Last updated timestamp" })
  updated_at!: Date;

  // Convenience aliases used by the frontend mapper
  get id(): number {
    return this.opportunity_id;
  }
}
