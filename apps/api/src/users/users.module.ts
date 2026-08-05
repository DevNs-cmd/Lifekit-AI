import { Module, forwardRef } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module";
import { UserRepository } from "./repositories/user.repository";
import { UsersService } from "./services/users.service";
import { UsersController } from "./controllers/users.controller";
import { AuthModule } from "../auth/auth.module";
import { PreferenceRepository } from "./repositories/preference.repository";

@Module({
  imports: [PrismaModule, forwardRef(() => AuthModule)],
  controllers: [UsersController],
  providers: [UsersService, UserRepository, PreferenceRepository],
  exports: [UsersService, UserRepository, PreferenceRepository],
})
export class UsersModule {}
