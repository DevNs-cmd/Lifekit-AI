import { ApiProperty } from "@nestjs/swagger";

export class UserPreference {
  @ApiProperty({
    description: "Unique identifier for the user preference",
    example: 1,
  })
  preference_id!: number;

  @ApiProperty({
    description: "Associated User ID",
    example: 1,
  })
  user_id!: number;

  @ApiProperty({
    description: "UI Theme preference",
    example: "dark",
    required: false,
  })
  theme?: string | null;

  @ApiProperty({
    description: "Language preference",
    example: "en",
    required: false,
  })
  language?: string | null;

  @ApiProperty({ description: "Flag to enable notifications", example: true })
  notification_enabled!: boolean;

  @ApiProperty({ description: "Time of daily reminders", required: false })
  reminder_time?: Date | null;

  @ApiProperty({ description: "Timezone", example: "UTC", required: false })
  timezone?: string | null;

  // Virtual arrays to keep interface compatibility
  goals?: string[];
  interests?: string[];
}
