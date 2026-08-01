import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module";
import { RecommendationRepository } from "./repositories/recommendation.repository";

@Module({
  imports: [PrismaModule],
  providers: [RecommendationRepository],
  exports: [RecommendationRepository],
})
export class RecommendationsModule {}
