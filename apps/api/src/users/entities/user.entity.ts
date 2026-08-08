import { ApiProperty } from "@nestjs/swagger";
import { UserPreference } from "./user-preference.entity";

export class User {
  @ApiProperty({
    description: "Unique identifier for the user",
    example: 1,
  })
  user_id!: number;

  @ApiProperty({
    description: "Email address of the user",
    example: "user@example.com",
  })
  email!: string;

  @ApiProperty({ description: "Full name of the user", example: "John Doe" })
  full_name!: string;

  @ApiProperty({ description: "Hashed password of the user" })
  password_hash!: string;

  @ApiProperty({
    description: "Phone number of the user",
    example: "+1234567890",
    required: false,
  })
  phone?: string | null;

  @ApiProperty({
    description: "Date of birth of the user",
    example: "1990-01-01",
    required: false,
  })
  date_of_birth?: Date | string | null;

  @ApiProperty({
    description: "Profession of the user",
    example: "Software Engineer",
    required: false,
  })
  profession?: string | null;

  @ApiProperty({
    description: "Profile photo URL of the user",
    example: "https://example.com/photo.jpg",
    required: false,
  })
  profile_photo?: string | null;

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

  // Virtual property to maintain compatibility
  preference?: UserPreference | null;
  subscriptionPlan?: string;

  // Relations matching production
  user_preferences?: UserPreference[];
  goals?: any[];
  interests?: any[];
}
