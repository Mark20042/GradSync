import { Queue } from 'bullmq';
import { env } from '@/config/environment.js';

// Setup connection options
const connection = process.env.REDIS_URL ? 
  { url: process.env.REDIS_URL } : 
  { host: '127.0.0.1', port: 6379 };

// Create our main task queue
export const taskQueue = new Queue('heavy-tasks', { connection });

// Helper to add jobs
export const enqueueAIJob = async (jobName: string, data: any) => {
  return await taskQueue.add(jobName, data, {
    removeOnComplete: true,
    removeOnFail: false,
    attempts: 3,
    backoff: { type: 'exponential', delay: 2000 }
  });
};
