import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module";
import { LifeMissionModule } from "../life-mission/life-mission.module";
import { PlannerRepository } from "./repositories/planner.repository";
import { PlannerService } from "./services/planner.service";
import { PlannerController } from "./controllers/planner.controller";

@Module({
  imports: [PrismaModule, LifeMissionModule],
  controllers: [PlannerController],
  providers: [PlannerRepository, PlannerService],
  exports: [PlannerRepository, PlannerService],
})
export class PlannerModule {}
