import { Router } from "express";
import { getAnalyticsOverview, getInDemandSkills, getJobCategories } from "@/controllers/analytics.controller.js";
import {
  getApplicationsOverTime,
  getTopJobs,
  getRetentionStats,
  getTerminationReasons,
  getSkillGaps,
  getAISummary,
} from "@/controllers/employer-analytics.controller.js";
import { authenticationMiddleware } from "@/middlewares/auth.middleware.js";

const router = Router();

// Existing
router.get("/overview", authenticationMiddleware, getAnalyticsOverview as any);
router.get("/public/in-demand-skills", getInDemandSkills as any);
router.get("/public/job-categories", getJobCategories as any);

// Phase 5: GradCoin-gated Employer Analytics
router.get("/employer/applications-over-time", authenticationMiddleware, getApplicationsOverTime as any);
router.get("/employer/top-jobs", authenticationMiddleware, getTopJobs as any);
router.get("/employer/retention", authenticationMiddleware, getRetentionStats as any);
router.get("/employer/termination-reasons", authenticationMiddleware, getTerminationReasons as any);
router.get("/employer/skill-gaps", authenticationMiddleware, getSkillGaps as any);
router.get("/employer/ai-summary", authenticationMiddleware, getAISummary as any);

export default router;
