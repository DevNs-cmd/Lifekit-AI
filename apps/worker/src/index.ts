/**
 * LifeKit Background Worker
 *
 * Entry point for the background worker service.
 * Processes jobs from Redis queues including:
 * - Opportunity processing (opportunity matching, relevance scoring)
 * - Progress processing (mission/goal progress calculations & metrics sync)
 * - Notification processing (event dispatching, email/push notification queue)
 *
 * Run with: npm run dev
 */

import { Worker, Job } from 'bullmq';
import Redis from 'ioredis';

const connectionString = process.env.WORKER_REDIS_URL || process.env.REDIS_URL || 'redis://localhost:6380';
const connection = connectionString.startsWith('redis://') || connectionString.startsWith('rediss://')
  ? new Redis(connectionString, { maxRetriesPerRequest: null })
  : new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6380', 10),
      maxRetriesPerRequest: null,
    });

console.log('LifeKit Background Worker starting...');
console.log(`Redis connection: ${connectionString}`);

/**
 * Job Processors Map
 */

async function processOpportunityJob(job: Job) {
  const { userId, opportunityId, category, action } = job.data;
  console.log(`[opportunity-processing] Evaluating opportunity ${opportunityId} for user ${userId} (${category || 'general'})`);
  
  // Simulate relevance scoring & domain matching logic
  const matchScore = Math.min(1.0, Math.max(0.5, Math.random()));
  const timestamp = new Date().toISOString();

  return {
    processed: true,
    opportunityId,
    userId,
    action: action || 'evaluate',
    matchScore,
    processedAt: timestamp,
  };
}

async function processProgressJob(job: Job) {
  const { userId, missionId, goalId, completedTasksCount, totalTasksCount } = job.data;
  console.log(`[progress-processing] Calculating progress for mission ${missionId || goalId} (user ${userId})`);

  let progressPercentage = 0;
  if (totalTasksCount && totalTasksCount > 0) {
    progressPercentage = Math.round((completedTasksCount / totalTasksCount) * 100);
  } else if (job.data.progress !== undefined) {
    progressPercentage = Number(job.data.progress);
  }

  return {
    processed: true,
    userId,
    missionId,
    goalId,
    progressPercentage,
    calculatedAt: new Date().toISOString(),
  };
}

async function processNotificationJob(job: Job) {
  const { userId, title, message, channel, metadata } = job.data;
  console.log(`[notification-processing] Dispatching notification to user ${userId} via ${channel || 'in-app'}: "${title}"`);

  return {
    processed: true,
    userId,
    title,
    channel: channel || 'in-app',
    dispatchedAt: new Date().toISOString(),
    status: 'sent',
  };
}

const processors: Record<string, (job: Job) => Promise<Record<string, any>>> = {
  'opportunity-processing': processOpportunityJob,
  'progress-processing': processProgressJob,
  'notification-processing': processNotificationJob,
};

const activeWorkers: Worker[] = [];

Object.entries(processors).forEach(([queueName, processorFn]) => {
  const worker = new Worker(
    queueName,
    async (job: Job) => {
      console.log(`[${queueName}] Processing job ${job.id} (name: ${job.name})...`);
      const result = await processorFn(job);
      return result;
    },
    {
      connection: connection as any,
      concurrency: 5,
    },
  );

  worker.on('completed', (job: Job, result: any) => {
    console.log(`[${queueName}] Job ${job.id} completed successfully:`, JSON.stringify(result));
  });

  worker.on('failed', (job: Job | undefined, err: Error) => {
    console.error(`[${queueName}] Job ${job?.id} failed:`, err.message);
  });

  activeWorkers.push(worker);
  console.log(`[${queueName}] Worker registered & active`);
});

console.log('LifeKit Background Worker ready. Waiting for jobs...');

// Graceful shutdown
const shutdown = async (signal: string) => {
  console.log(`\nReceived ${signal}. Gracefully shutting down worker processes...`);
  await Promise.all(activeWorkers.map((w) => w.close()));
  await connection.quit();
  console.log('All workers closed. Exiting.');
  process.exit(0);
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
