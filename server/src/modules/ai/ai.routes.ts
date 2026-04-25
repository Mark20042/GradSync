import { Router } from 'express';
import { protect } from '../../shared/middleware/auth.middleware.js';
import {
  checkSuitability,
  generateSummary,
  scanForMatches,
  checkCandidateSuitability,
  askMentor,
} from './ai.controller.js';

const router = Router();

/**
 * AI Module Routes
 *
 * All routes require authentication via JWT (protect middleware).
 *
 * POST /suitability           — Check job suitability for current user
 * POST /summary               — Generate AI profile summary
 * POST /scan-matches          — Scan for job matches and notify
 * POST /candidate-suitability — Check candidate suitability (employer)
 * POST /mentor                — Ask the AI career mentor
 */

// Cast handlers to any to accommodate AuthenticatedRequest vs Request mismatch
// This is safe because the protect middleware guarantees req.user exists
router.post('/suitability', protect as any, checkSuitability as any);
router.post('/summary', protect as any, generateSummary as any);
router.post('/scan-matches', protect as any, scanForMatches as any);
router.post('/candidate-suitability', protect as any, checkCandidateSuitability as any);
router.post('/mentor', protect as any, askMentor as any);

export default router;
