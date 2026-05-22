import { Router } from "express";
import * as ctrl from "@/controllers/employerAssessment.controller.js";
import {
  authenticationMiddleware,
  employerMiddleware,
} from "@/middlewares/auth.middleware.js";

const router = Router();

router.get("/", authenticationMiddleware, employerMiddleware, ctrl.getAllForEmployer as any);
router.get("/detail/:id", authenticationMiddleware, ctrl.getDetail as any);
router.post("/", authenticationMiddleware, employerMiddleware, ctrl.create as any);
router.put("/:id", authenticationMiddleware, employerMiddleware, ctrl.update as any);
router.delete("/:id", authenticationMiddleware, employerMiddleware, ctrl.remove as any);

router.post("/:id/questions", authenticationMiddleware, employerMiddleware, ctrl.addQuestion as any);
router.put(
  "/:assessmentId/questions/:questionId",
  authenticationMiddleware,
  employerMiddleware,
  ctrl.updateQuestion as any,
);
router.delete(
  "/:assessmentId/questions/:questionId",
  authenticationMiddleware,
  employerMiddleware,
  ctrl.deleteQuestion as any,
);

router.post("/submit", authenticationMiddleware, ctrl.submit as any);
router.get("/submissions", authenticationMiddleware, employerMiddleware, ctrl.getSubmissionsForEmployer as any);
router.put("/submissions/:id/release-score", authenticationMiddleware, employerMiddleware, ctrl.releaseScore as any);

router.post("/invite", authenticationMiddleware, employerMiddleware, ctrl.inviteCandidate as any);
router.get("/invitations", authenticationMiddleware, ctrl.getInvitationsForCandidate as any);

export default router;
