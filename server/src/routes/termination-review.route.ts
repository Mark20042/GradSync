import { Router } from 'express';
import { authenticationMiddleware } from '@/middlewares/auth.middleware.js';
import {
  terminateApplicant,
  submitEmployerRating,
  submitJobseekerRating,
  getMyPendingRatings,
  dismissRatingPrompt,
  getJobReviews,
  getCompanyReviews,
  getEmployeeConductScore,
  getEmployeeReviews,
  getTerminationReasons,
  createTerminationReason,
  updateTerminationReason,
  deleteTerminationReason,
} from '@/controllers/termination-review.controller.js';

const router = Router();

// Public routes (still need auth to know who the caller is)
router.get('/reasons', authenticationMiddleware, getTerminationReasons as any);
router.get('/job/:jobId', authenticationMiddleware, getJobReviews as any);
router.get('/company/:companyId', authenticationMiddleware, getCompanyReviews as any);
router.get('/employee/:userId/score', authenticationMiddleware, getEmployeeConductScore as any);
router.get('/employee/:userId/reviews', authenticationMiddleware, getEmployeeReviews as any);

// Jobseeker routes
router.get('/my-pending', authenticationMiddleware, getMyPendingRatings as any);
router.patch('/:id/dismiss', authenticationMiddleware, dismissRatingPrompt as any);
router.patch('/:id/jobseeker-rate', authenticationMiddleware, submitJobseekerRating as any);

// Employer routes
router.post('/terminate', authenticationMiddleware, terminateApplicant as any);
router.patch('/:id/employer-rate', authenticationMiddleware, submitEmployerRating as any);

// Admin reason management (these will also be accessible via /api/admin/termination-reasons)
router.post('/reasons', authenticationMiddleware, createTerminationReason as any);
router.patch('/reasons/:id', authenticationMiddleware, updateTerminationReason as any);
router.delete('/reasons/:id', authenticationMiddleware, deleteTerminationReason as any);

export default router;
