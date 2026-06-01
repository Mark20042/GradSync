import { Router } from "express";
import { authenticationMiddleware, adminMiddleware } from "@/middlewares/auth.middleware.js";
import {
  generateAssessmentController,
  generateAllAssessmentsController,
  generateMissingAssessmentsController,
  approveAssessmentController,
  deleteAssessmentController,
  generateInterviewDraftController,
  approveInterviewDraftController,
  getMyApprovedAssessments,
  getMyApprovedInterviewDrafts,
  getAssessmentsByCandidate,
  getInterviewDraftsByCandidate,
  deleteInterviewQuestionController,
  deleteInterviewDraftController,
  updateInterviewQuestionController,
  addInterviewQuestionController,
  addAssessmentQuestionController,
  updateAssessmentQuestionController,
  deleteAssessmentQuestionController
} from "@/controllers/generation.controller.js";

const router = Router();

// Jobseeker / Graduate routes
router.get("/my-assessments", authenticationMiddleware, getMyApprovedAssessments);
router.get("/my-interviews", authenticationMiddleware, getMyApprovedInterviewDrafts);

// Admin routes (Protected by auth and admin middleware)
router.use(authenticationMiddleware);
router.use(adminMiddleware as any);

// Assessments
router.post("/assessments/generate", generateAssessmentController);
router.post("/assessments/generate-all", generateAllAssessmentsController);
router.post("/assessments/generate-missing", generateMissingAssessmentsController);
router.patch("/assessments/:id/approve", approveAssessmentController);
router.delete("/assessments/:id", deleteAssessmentController);
router.post("/assessments/:id/questions", addAssessmentQuestionController);
router.put("/assessments/:id/questions/:questionId", updateAssessmentQuestionController);
router.delete("/assessments/:id/questions/:questionId", deleteAssessmentQuestionController);
router.get("/assessments/candidate/:candidateId", getAssessmentsByCandidate);

// Interviews
router.post("/interviews/generate", generateInterviewDraftController);
router.patch("/interviews/:id/approve", approveInterviewDraftController);
router.delete("/interviews/:id", deleteInterviewDraftController);
router.post("/interviews/:id/questions", addInterviewQuestionController);
router.delete("/interviews/:id/questions/:questionId", deleteInterviewQuestionController);
router.put("/interviews/:id/questions/:questionId", updateInterviewQuestionController);
router.get("/interviews/candidate/:candidateId", getInterviewDraftsByCandidate);

export default router;
