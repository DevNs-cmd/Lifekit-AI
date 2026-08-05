import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module";
import { LifeMissionRepository } from "./repositories/life-mission.repository";
import { LifeMissionService } from "./services/life-mission.service";
import { LifeMissionController } from "./controllers/life-mission.controller";

@Module({
  imports: [PrismaModule],
  controllers: [LifeMissionController],
  providers: [LifeMissionRepository, LifeMissionService],
  exports: [LifeMissionRepository, LifeMissionService],
})
export class LifeMissionModule {}
