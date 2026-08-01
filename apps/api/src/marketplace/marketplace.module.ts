import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module";
import { MarketplaceRepository } from "./repositories/marketplace.repository";

@Module({
  imports: [PrismaModule],
  providers: [MarketplaceRepository],
  exports: [MarketplaceRepository],
})
export class MarketplaceModule {}
