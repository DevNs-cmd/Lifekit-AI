import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module";
import { RecommendationRepository } from "./repositories/recommendation.repository";
import { RecommendationsService } from "./services/recommendations.service";
import { RecommendationsController } from "./controllers/recommendations.controller";

@Module({
  imports: [PrismaModule],
  controllers: [RecommendationsController],
  providers: [RecommendationRepository, RecommendationsService],
  exports: [RecommendationRepository, RecommendationsService],
})
export class RecommendationsModule {}
