import type { Application } from 'express';
import analyticsRoutes from './analytics.routes.js';

export const registerAnalyticsModule = (app: Application): void => {
  app.use('/api/analytics', analyticsRoutes);
  console.log('📊 Analytics Module registered at /api/analytics');
};
