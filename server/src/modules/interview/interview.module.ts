import type { Application } from 'express';
import interviewRoutes from './interview.routes.js';
import interviewRoleRoutes from './interview-role.routes.js';
import interviewQuestionRoutes from './interview-question.routes.js';

export const registerInterviewModule = (app: Application): void => {
  app.use('/api/interviews', interviewRoutes);
  app.use('/api/interview-roles', interviewRoleRoutes);
  app.use('/api/interview-questions', interviewQuestionRoutes);
  console.log('🎤 Interview Module registered at /api/interviews, /api/interview-roles, /api/interview-questions');
};
