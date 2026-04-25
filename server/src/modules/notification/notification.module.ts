import type { Application } from 'express';
import notificationRoutes from './notification.routes.js';

export const registerNotificationModule = (app: Application): void => {
  app.use('/api/notifications', notificationRoutes);
  console.log('🔔 Notification Module registered at /api/notifications');
};
