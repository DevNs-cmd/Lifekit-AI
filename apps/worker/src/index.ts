/**
 * LifeKit Background Worker
 *
 * Entry point for the background worker service.
 * Processes jobs from Redis queues including:
 * - Opportunity processing
 * - Progress processing
 * - Notification processing
 *
 * Run with: npm run dev
 */

import { Worker } from 'bullmq';

const connection = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
};

console.log('LifeKit Worker starting...');
console.log(`Redis connection: ${connection.host}:${connection.port}`);

// Placeholder worker queues — to be implemented with specific job processors
const queues = ['opportunity-processing', 'progress-processing', 'notification-processing'];

queues.forEach((queueName) => {
  const worker = new Worker(
    queueName,
    async (job) => {
      console.log(`[${queueName}] Processing job ${job.id}:`, job.data);
      // TODO: Implement job processor logic
      return { processed: true, queue: queueName, jobId: job.id };
    },
    { connection },
  );

  worker.on('completed', (job) => {
    console.log(`[${queueName}] Job ${job.id} completed successfully`);
  });

  worker.on('failed', (job, err) => {
    console.error(`[${queueName}] Job ${job?.id} failed:`, err.message);
  });

  console.log(`[${queueName}] Worker registered`);
});

console.log('LifeKit Worker ready. Waiting for jobs...');

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\nShutting down worker...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\nShutting down worker...');
  process.exit(0);
});

