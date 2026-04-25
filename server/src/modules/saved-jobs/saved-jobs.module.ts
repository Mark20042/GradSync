import type { Application } from 'express';
import savedJobsRoutes from './saved-jobs.routes.js';

export const registerSavedJobsModule = (app: Application): void => {
  app.use('/api/save-jobs', savedJobsRoutes);
  console.log('💾 SavedJobs Module registered at /api/save-jobs');
};
