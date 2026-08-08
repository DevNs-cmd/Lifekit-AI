import { PartialType } from "@nestjs/swagger";
import { CreateOpportunityDto } from "./create-opportunity.dto";
import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";

export class UpdateOpportunityDto extends PartialType(CreateOpportunityDto) {
  @ApiPropertyOptional({
    description: "Status of the opportunity",
    example: "APPLIED",
  })
  @IsString()
  @IsOptional()
  status?: string;
}
