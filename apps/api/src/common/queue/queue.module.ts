import { Global, Module } from "@nestjs/common";
import { BullModule } from "@nestjs/bullmq";
import { AppConfigService } from "../../config/app-config.service";
import { QueueService } from "./queue.service";

@Global()
@Module({
  imports: [
    BullModule.forRootAsync({
      useFactory: (config: AppConfigService) => {
        return {
          connection: {
            url: config.redisUrl,
          },
        };
      },
      inject: [AppConfigService],
    }),
  ],
  providers: [QueueService],
  exports: [BullModule, QueueService],
})
export class QueueModule {}
