import type { Application } from 'express';
import assessmentRoutes from './assessment.routes.js';

export const registerAssessmentModule = (app: Application): void => {
  app.use('/api/assessments', assessmentRoutes);
  console.log('📝 Assessment Module registered at /api/assessments');
};
