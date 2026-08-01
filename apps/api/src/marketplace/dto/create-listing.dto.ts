import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsString,
  Min,
  MinLength,
  ValidateNested,
} from "class-validator";
import { ListingAvailabilityDto } from "./listing-availability.dto";

export class CreateListingDto {
  @ApiProperty({
    description: "Title of the listing",
    example: "Productivity Blueprint Course",
    minLength: 5,
  })
  @IsString()
  @IsNotEmpty({ message: "Title is required" })
  @MinLength(5, { message: "Title must be at least 5 characters long" })
  title!: string;

  @ApiProperty({
    description: "Description of the listing",
    example:
      "A complete guide to mastering time management and daily schedules.",
    minLength: 10,
  })
  @IsString()
  @IsNotEmpty({ message: "Description is required" })
  @MinLength(10, { message: "Description must be at least 10 characters long" })
  description!: string;

  @ApiProperty({
    description: "The category classification of the item",
    example: "Templates",
  })
  @IsString()
  @IsNotEmpty({ message: "Category is required" })
  category!: string;

  @ApiProperty({
    description: "Taxonomy tags describing the content",
    example: ["productivity", "notion", "habits"],
  })
  @IsArray()
  @IsString({ each: true })
  tags!: string[];

  @ApiProperty({ description: "Cost price of the listing", example: 19.99 })
  @IsNumber()
  @Min(0, { message: "Price cannot be negative" })
  price!: number;

  @ApiProperty({
    description: "Indicates if the item is free of charge",
    example: false,
  })
  @IsBoolean()
  isFree!: boolean;

  @ApiProperty({
    description: "Availability configurations",
    type: () => ListingAvailabilityDto,
  })
  @ValidateNested()
  @Type(() => ListingAvailabilityDto)
  availability!: ListingAvailabilityDto;
}
