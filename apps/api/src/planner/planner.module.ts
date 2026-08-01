import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module";
import { PlannerRepository } from "./repositories/planner.repository";

@Module({
  imports: [PrismaModule],
  providers: [PlannerRepository],
  exports: [PlannerRepository],
})
export class PlannerModule {}
