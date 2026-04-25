import type { Application } from 'express';
import employerRoutes from './employer.routes.js';

export const registerEmployerModule = (app: Application): void => {
  app.use('/api/employer', employerRoutes);
  console.log('🏢 Employer Module registered at /api/employer');
};
