import { ApiProperty } from "@nestjs/swagger";

export class Session {
  @ApiProperty({
    description: "Unique identifier for the session",
    example: "session-123",
  })
  id!: string;

  @ApiProperty({
    description: "Associated User ID",
    example: 1,
  })
  userId!: number;

  @ApiProperty({ description: "Refresh token associated with the session" })
  token!: string;

  @ApiProperty({
    description: "User Agent of the client session",
    required: false,
    example: "Mozilla/5.0...",
  })
  userAgent?: string | null;

  @ApiProperty({
    description: "IP Address of the client session",
    required: false,
    example: "127.0.0.1",
  })
  ipAddress?: string | null;

  @ApiProperty({
    description: "Expiration date of the session",
    example: "2026-08-28T12:00:00Z",
  })
  expiresAt!: Date;

  @ApiProperty({
    description: "Creation date",
    example: "2026-07-28T12:00:00Z",
  })
  createdAt!: Date;

  @ApiProperty({
    description: "Last update date",
    example: "2026-07-28T12:00:00Z",
  })
  updatedAt!: Date;
}
