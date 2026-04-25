import type { Application } from 'express';
import applicationRoutes from './application.routes.js';

export const registerApplicationModule = (app: Application): void => {
  app.use('/api/applications', applicationRoutes);
  console.log('📋 Application Module registered at /api/applications');
};
