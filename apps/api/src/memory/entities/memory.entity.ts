import { ApiProperty } from "@nestjs/swagger";
export class Memory {
  @ApiProperty({
    description: "Unique identifier for the memory entry",
    example: 1,
  })
  memory_id!: number;

  @ApiProperty({
    description: "Associated User ID",
    example: 1,
  })
  user_id!: number;

  @ApiProperty({
    description: "The main textual content of the memory entry",
    example:
      "Reflected on my career goals today and realized I want to pivot towards AI research.",
  })
  content!: string;

  @ApiProperty({
    description: "The classification category of this memory",
    example: "JOURNAL",
  })
  memory_type!: string;

  @ApiProperty({
    description: "Optional title or brief summary of the memory",
    required: false,
    example: "Career reflection",
  })
  title?: string | null;

  @ApiProperty({
    description: "Importance rating score (0.0 to 1.0)",
    required: false,
    example: 0.85,
  })
  importance_score?: number | null;

  @ApiProperty({
    description: "Associated AI embedding ID",
    required: false,
    example: "embedding-xyz",
  })
  embedding_id?: string | null;

  @ApiProperty({
    description: "Creation date",
    example: "2026-07-28T12:00:00Z",
  })
  created_at!: Date;

  @ApiProperty({
    description: "Last update date",
    example: "2026-07-28T12:00:00Z",
  })
  updated_at!: Date;

  // Compatibility virtual fields
  metadata?: Record<string, any> | null;
  contextInfo?: string | null;

  get id(): number {
    return this.memory_id;
  }

  get userId(): number {
    return this.user_id;
  }

  get type(): string {
    return this.memory_type;
  }
}
