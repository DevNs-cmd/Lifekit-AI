import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module";
import { LifeMissionRepository } from "./repositories/life-mission.repository";

@Module({
  imports: [PrismaModule],
  providers: [LifeMissionRepository],
  exports: [LifeMissionRepository],
})
export class LifeMissionModule {}
