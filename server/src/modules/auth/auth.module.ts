import type { Application } from 'express';
import authRoutes from './auth.routes.js';

export const registerAuthModule = (app: Application): void => {
  app.use('/api/auth', authRoutes);
  console.log('🔐 Auth Module registered at /api/auth');
};
