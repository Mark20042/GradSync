import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { env } from './shared/config/environment.js';

// ESM _dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ─── Module Registrations ────────────────────────────────────────────────
import { registerAiModule } from './modules/ai/ai.module.js';
import { registerAuthModule } from './modules/auth/auth.module.js';
import { registerUserModule } from './modules/user/user.module.js';
import { registerJobModule } from './modules/job/job.module.js';
import { registerApplicationModule } from './modules/application/application.module.js';
import { registerNotificationModule } from './modules/notification/notification.module.js';
import { registerSavedJobsModule } from './modules/saved-jobs/saved-jobs.module.js';
import { registerAnalyticsModule } from './modules/analytics/analytics.module.js';
import { registerAssessmentModule } from './modules/assessment/assessment.module.js';
import { registerInterviewModule } from './modules/interview/interview.module.js';
import { registerMessagingModule } from './modules/messaging/messaging.module.js';
import { registerEmployerModule } from './modules/employer/employer.module.js';
import { registerAdminModule } from './modules/admin/admin.module.js';

/**
 * Express Application Factory
 *
 * Creates and configures the Express application with:
 * - CORS configuration
 * - JSON body parsing
 * - All feature module registrations
 * - Health check endpoint
 * - Global error handling
 */
const createApp = (): express.Application => {
  const app = express();

  // ─── CORS Configuration ────────────────────────────────────────────
  const corsOptions: cors.CorsOptions = {
    origin: env.CORS_ORIGINS,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  };
  app.use(cors(corsOptions));

  // ─── Core Middleware ───────────────────────────────────────────────
  app.use(express.json());

  // ─── Static Files ──────────────────────────────────────────────────
  // Serve the uploads folder (avatars, resumes, etc.)
  app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

  // ─── Health Check ──────────────────────────────────────────────────
  app.get('/health', (_req, res) => {
    res.status(200).json({
      status: 'ok',
      service: 'GradSync API (Modular)',
      timestamp: new Date().toISOString(),
      environment: env.NODE_ENV,
    });
  });

  // ─── Module Registration ───────────────────────────────────────────
  // Each module is a self-contained domain that registers its own routes.
  console.log('');
  console.log('─── Registering Modules ───');
  registerAuthModule(app);
  registerUserModule(app);
  registerJobModule(app);
  registerApplicationModule(app);
  registerSavedJobsModule(app);
  registerNotificationModule(app);
  registerAnalyticsModule(app);
  registerAssessmentModule(app);
  registerInterviewModule(app);
  registerMessagingModule(app);
  registerEmployerModule(app);
  registerAiModule(app);
  registerAdminModule(app);
  console.log('─── All Modules Registered ───');
  console.log('');

  // ─── 404 Handler ───────────────────────────────────────────────────
  app.use((_req, res) => {
    res.status(404).json({ message: 'Route not found' });
  });

  // ─── Global Error Handler ─────────────────────────────────────────
  app.use(
    (
      err: Error,
      _req: express.Request,
      res: express.Response,
      _next: express.NextFunction
    ) => {
      console.error('💥 Unhandled Error:', err.message);
      res.status(500).json({
        message: 'Internal Server Error',
        ...(env.NODE_ENV === 'development' && { error: err.message }),
      });
    }
  );

  return app;
};

export default createApp;
