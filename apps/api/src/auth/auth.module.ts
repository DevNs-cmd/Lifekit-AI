import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { PassportModule } from "@nestjs/passport";
import { PrismaModule } from "../prisma/prisma.module";
import { UsersModule } from "../users/users.module";
import { AuthController } from "./auth.controller";
import { JwtStrategy } from "./jwt.strategy";
import { SessionRepository } from "./repositories/session.repository";
import { AuthService } from "./auth.service";

@Module({
  imports: [
    PrismaModule,
    UsersModule,
    ConfigModule,
    PassportModule.register({ defaultStrategy: "jwt" }),
  ],
  controllers: [AuthController],
  providers: [SessionRepository, AuthService, JwtStrategy],
  exports: [SessionRepository, AuthService],
})
export class AuthModule {}
