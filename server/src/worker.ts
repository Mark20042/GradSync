import { Worker, Job } from 'bullmq';
import { connectDB } from './config/db.js';
import * as dotenv from 'dotenv';

dotenv.config();

const connection = process.env.REDIS_URL ? 
  { url: process.env.REDIS_URL } : 
  { host: '127.0.0.1', port: 6379 };

const startWorker = async () => {
  try {
    console.log('⏳ Worker starting...');
    await connectDB();
    console.log('✅ Worker connected to MongoDB');

    const worker = new Worker('heavy-tasks', async (job: Job) => {
      console.log(`Processing job ${job.id} of type ${job.name}`);
      
      switch (job.name) {
        case 'ai-generation':
          console.log('Executing AI Generation task...', job.data);
          // TODO: Migrate logic from aiController here
          break;
        case 'ocr-processing':
          console.log('Executing OCR task...', job.data);
          // TODO: Migrate PDF parse / Tesseract logic here
          break;
        default:
          console.log(`Unknown job type: ${job.name}`);
      }
      
      return { success: true };
    }, { connection });

    worker.on('completed', (job) => {
      console.log(`Job ${job.id} completed successfully`);
    });

    worker.on('failed', (job, err) => {
      console.log(`Job ${job?.id} failed with error: ${err.message}`);
    });

    console.log('🚀 Worker is listening for jobs on queue: heavy-tasks');
  } catch (error) {
    console.error('❌ Failed to start worker:', error);
    process.exit(1);
  }
};

startWorker();
