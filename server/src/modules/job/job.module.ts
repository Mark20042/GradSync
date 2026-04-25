import type { Application } from 'express';
import jobRoutes from './job.routes.js';

export const registerJobModule = (app: Application): void => {
  app.use('/api/jobs', jobRoutes);
  console.log('💼 Job Module registered at /api/jobs');
};
