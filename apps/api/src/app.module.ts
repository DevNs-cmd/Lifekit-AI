import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import {
  configLoads,
  validate,
  AppConfigModule,
  AppConfigService,
} from "./config";
import { HealthModule } from "./health/health.module";
import { PrismaModule } from "./prisma/prisma.module";
import { UsersModule } from "./users/users.module";
import { AuthModule } from "./auth/auth.module";
import { LifeMissionModule } from "./life-mission/life-mission.module";
import { PlannerModule } from "./planner/planner.module";
import { TasksModule } from "./tasks/tasks.module";
import { MemoryModule } from "./memory/memory.module";
import { RecommendationsModule } from "./recommendations/recommendations.module";
import { MarketplaceModule } from "./marketplace/marketplace.module";
import { AgentsModule } from "./agents/agents.module";
import { NotificationsModule } from "./notifications/notifications.module";

import { ThrottlerModule, ThrottlerGuard } from "@nestjs/throttler";
import { ScheduleModule } from "@nestjs/schedule";

// Infrastructure Modules
import { CacheModule } from "./common/cache";
import { QueueModule } from "./common/queue";
import { UploadModule } from "./common/upload";

// Middlewares
import { RequestIdMiddleware } from "./common/middleware/request-id.middleware";
import { RequestLoggingMiddleware } from "./common/middleware/request-logging.middleware";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: configLoads,
      validate,
      envFilePath: [".env", "../../.env"],
    }),

    ScheduleModule.forRoot(),

    AppConfigModule,
    ThrottlerModule.forRootAsync({
      inject: [AppConfigService],
      useFactory: (config: AppConfigService) => [
        {
          ttl: config.throttlerTtl * 1000, // seconds to ms
          limit: config.throttlerLimit,
        },
      ],
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
    AgentsModule,
    NotificationsModule,
    CacheModule,
    QueueModule,
    UploadModule,
  ],
  providers: [ThrottlerGuard],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(RequestIdMiddleware, RequestLoggingMiddleware)
      .forRoutes("*");
  }
}
