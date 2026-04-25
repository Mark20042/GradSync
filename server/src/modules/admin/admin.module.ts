import type { Application } from 'express';
import adminRoutes from './admin.routes.js';

export const registerAdminModule = (app: Application): void => {
  app.use('/api/admin', adminRoutes);
  console.log('🛡️ Admin Module registered at /api/admin');
};
