import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module";
import { AppConfigModule } from "../config/app-config.module";
import { EventEmitterModule } from "@nestjs/event-emitter";
import { MarketplaceRepository } from "./repositories/marketplace.repository";
import { MarketplaceService } from "./services/marketplace.service";
import { MarketplaceController } from "./controllers/marketplace.controller";

@Module({
  imports: [PrismaModule, AppConfigModule, EventEmitterModule],
  controllers: [MarketplaceController],
  providers: [MarketplaceRepository, MarketplaceService],
  exports: [MarketplaceRepository, MarketplaceService],
})
export class MarketplaceModule {}
