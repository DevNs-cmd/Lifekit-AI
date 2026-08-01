import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module";
import { UserRepository } from "./repositories/user.repository";
import { SessionRepository } from "../auth/repositories/session.repository";
import { UsersService } from "./services/users.service";
import { UsersController } from "./controllers/users.controller";

@Module({
  imports: [PrismaModule],
  controllers: [UsersController],
  providers: [UsersService, UserRepository, SessionRepository],
  exports: [UsersService, UserRepository],
})
export class UsersModule {}
