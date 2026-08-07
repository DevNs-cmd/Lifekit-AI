import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module";
import { AppConfigModule } from "../config/app-config.module";
import { MarketplaceRepository } from "./repositories/marketplace.repository";
import { MarketplaceService } from "./services/marketplace.service";
import { MarketplaceController } from "./controllers/marketplace.controller";

@Module({
  imports: [PrismaModule, AppConfigModule],
  controllers: [MarketplaceController],
  providers: [MarketplaceRepository, MarketplaceService],
  exports: [MarketplaceRepository, MarketplaceService],
})
export class MarketplaceModule {}
