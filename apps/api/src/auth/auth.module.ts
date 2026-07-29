import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { SessionRepository } from './repositories/session.repository';

@Module({
  imports: [PrismaModule],
  providers: [SessionRepository],
  exports: [SessionRepository],
})
export class AuthModule {}
