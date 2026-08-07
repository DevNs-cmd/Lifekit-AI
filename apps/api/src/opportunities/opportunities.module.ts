import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module";
import { AppConfigModule } from "../config/app-config.module";
import { OpportunitiesRepository } from "./repositories/opportunities.repository";
import { OpportunitiesService } from "./services/opportunities.service";
import { AiOpportunitiesService } from "./services/ai-opportunities.service";
import { OpportunitiesController } from "./controllers/opportunities.controller";

@Module({
  imports: [PrismaModule, AppConfigModule],
  controllers: [OpportunitiesController],
  providers: [
    OpportunitiesRepository,
    AiOpportunitiesService,
    OpportunitiesService,
  ],
  exports: [OpportunitiesRepository, OpportunitiesService],
})
export class OpportunitiesModule {}
