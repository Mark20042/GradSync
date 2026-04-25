import type { Application } from 'express';
import userRoutes from './user.routes.js';

export const registerUserModule = (app: Application): void => {
  app.use('/api/users', userRoutes);
  console.log('👤 User Module registered at /api/users');
};
