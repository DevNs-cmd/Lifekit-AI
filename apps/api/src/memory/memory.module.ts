import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module";
import { MemoryRepository } from "./repositories/memory.repository";

@Module({
  imports: [PrismaModule],
  providers: [MemoryRepository],
  exports: [MemoryRepository],
})
export class MemoryModule {}
