import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { configLoads, validate } from './config';
import { HealthModule } from './health/health.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: configLoads,
      validate,
      envFilePath: ['.env', '../../.env'],
    }),

    PrismaModule,
    HealthModule,
  ],
})
export class AppModule {}
