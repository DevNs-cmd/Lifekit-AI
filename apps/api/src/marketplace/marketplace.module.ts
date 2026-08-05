import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module";
import { MarketplaceRepository } from "./repositories/marketplace.repository";
import { MarketplaceService } from "./services/marketplace.service";
import { MarketplaceController } from "./controllers/marketplace.controller";

@Module({
  imports: [PrismaModule],
  controllers: [MarketplaceController],
  providers: [MarketplaceRepository, MarketplaceService],
  exports: [MarketplaceRepository, MarketplaceService],
})
export class MarketplaceModule {}
