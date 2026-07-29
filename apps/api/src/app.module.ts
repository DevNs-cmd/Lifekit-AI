import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { configLoads, validate } from './config';
import { HealthModule } from './health/health.module';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { LifeMissionModule } from './life-mission/life-mission.module';
import { PlannerModule } from './planner/planner.module';
import { TasksModule } from './tasks/tasks.module';
import { MemoryModule } from './memory/memory.module';
import { RecommendationsModule } from './recommendations/recommendations.module';
import { MarketplaceModule } from './marketplace/marketplace.module';

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
    UsersModule,
    AuthModule,
    LifeMissionModule,
    PlannerModule,
    TasksModule,
    MemoryModule,
    RecommendationsModule,
    MarketplaceModule,
  ],
})
export class AppModule {}
