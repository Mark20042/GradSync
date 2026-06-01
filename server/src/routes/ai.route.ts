import { Router } from "express";
import { authenticationMiddleware } from "@/middlewares/auth.middleware.js";
import { checkSuitability, generateSummary, scanForMatches, checkCandidateSuitability, submitFeatureFeedback } from "@/controllers/ai.controller.js";

const router = Router();

router.post("/suitability", authenticationMiddleware, checkSuitability as any);
router.post("/summary", authenticationMiddleware, generateSummary as any);
router.post("/scan-matches", authenticationMiddleware, scanForMatches as any);
router.post("/candidate-suitability", authenticationMiddleware, checkCandidateSuitability as any);
router.post("/feedback", authenticationMiddleware, submitFeatureFeedback as any);

export default router;
