import { Injectable, Logger, OnApplicationShutdown } from "@nestjs/common";
import { Queue, ConnectionOptions, Job } from "bullmq";
import { AppConfigService } from "../../config/app-config.service";

@Injectable()
export class QueueService implements OnApplicationShutdown {
  private readonly logger = new Logger(QueueService.name);
  private readonly connection: ConnectionOptions;
  private readonly queues: Map<string, Queue> = new Map();

  constructor(private readonly config: AppConfigService) {
    this.connection = {
      url: this.config.redisUrl,
    };
  }

  /**
   * Dynamically retrieves or creates a BullMQ Queue instance.
   *
   * @param queueName Name of the background job queue
   */
  getQueue(queueName: string): Queue {
    let queue = this.queues.get(queueName);

    if (!queue) {
      this.logger.log(
        `Initializing and registering background queue: ${queueName}`,
      );
      queue = new Queue(queueName, {
        connection: this.connection,
        defaultJobOptions: {
          attempts: 3,
          backoff: {
            type: "exponential",
            delay: 1000, // 1 second base backoff
          },
          removeOnComplete: 100, // keep last 100 jobs
          removeOnFail: 500, // keep last 500 failed jobs
        },
      });
      this.queues.set(queueName, queue);
    }

    return queue;
  }

  /**
   * Adds a job to a specific background queue.
   *
   * @param queueName Queue name target
   * @param jobName Name of the job
   * @param data Payload of the job
   * @param options Custom job overrides
   */
  async addJob<T = any>(
    queueName: string,
    jobName: string,
    data: T,
    options?: any,
  ): Promise<Job<T>> {
    const queue = this.getQueue(queueName);
    this.logger.log(
      `Enqueuing background job "${jobName}" in queue "${queueName}"`,
    );
    return await queue.add(jobName, data, options);
  }

  async onApplicationShutdown() {
    this.logger.log("Closing all registered BullMQ queues...");
    for (const [name, queue] of this.queues.entries()) {
      try {
        await queue.close();
        this.logger.log(`Successfully closed queue client: ${name}`);
      } catch (err: any) {
        this.logger.error(`Error closing queue client ${name}: ${err.message}`);
      }
    }
    this.queues.clear();
  }
}
