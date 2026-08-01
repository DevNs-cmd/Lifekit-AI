import { PartialType } from "@nestjs/swagger";
import { CreateLifeMissionDto } from "./create-life-mission.dto";

export class UpdateLifeMissionDto extends PartialType(CreateLifeMissionDto) {}
