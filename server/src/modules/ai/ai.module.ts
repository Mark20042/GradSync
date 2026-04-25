import type { Application } from 'express';
import aiRoutes from './ai.routes.js';

/**
 * AI Module Registration
 *
 * Mounts all AI-related routes under /api/ai.
 * This is the single entry point for integrating the AI module
 * into the Express application.
 *
 * Encapsulated features:
 * - Job suitability analysis (Ollama)
 * - AI profile summary generation
 * - Job match scanning with notifications
 * - Candidate suitability for employers
 * - AI career mentor chatbot
 */
export const registerAiModule = (app: Application): void => {
  app.use('/api/ai', aiRoutes);
  console.log('🤖 AI Module registered at /api/ai');
};
