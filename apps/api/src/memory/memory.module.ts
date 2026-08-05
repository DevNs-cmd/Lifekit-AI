import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module";
import { MemoryRepository } from "./repositories/memory.repository";
import { MemoryService } from "./services/memory.service";
import { MemoryController } from "./controllers/memory.controller";

@Module({
  imports: [PrismaModule],
  controllers: [MemoryController],
  providers: [MemoryRepository, MemoryService],
  exports: [MemoryRepository, MemoryService],
})
export class MemoryModule {}
