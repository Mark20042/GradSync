import { Router } from "express";
import * as ctrl from "@/controllers/assessment.controller.js";
import {
  authenticationMiddleware,
  adminMiddleware,
} from "@/middlewares/auth.middleware.js";

const router = Router();

router.get("/", authenticationMiddleware, ctrl.getAll);
router.get("/detail/:id", authenticationMiddleware, ctrl.getDetail);
router.post("/", authenticationMiddleware, ctrl.create);
router.post("/submit", authenticationMiddleware, ctrl.submit as any);
router.get(
  "/submissions/review",
  authenticationMiddleware,
  adminMiddleware,
  ctrl.getSubmissionsForReview,
);
router.delete(
  "/submissions/:id",
  authenticationMiddleware,
  adminMiddleware,
  ctrl.deleteSubmission as any,
);
router.put("/:id", authenticationMiddleware, ctrl.update);
router.delete("/:id", authenticationMiddleware, ctrl.remove);
router.post("/:id/questions", authenticationMiddleware, ctrl.addQuestion);
router.put(
  "/:assessmentId/questions/:questionId",
  authenticationMiddleware,
  ctrl.updateQuestion,
);
router.delete(
  "/:assessmentId/questions/:questionId",
  authenticationMiddleware,
  ctrl.deleteQuestion,
);
router.get("/:skill/users", authenticationMiddleware, ctrl.getVerifiedUsers);
router.delete(
  "/:skill/users/:userId",
  authenticationMiddleware,
  ctrl.unverifyUser,
);
router.get("/:skill", authenticationMiddleware, ctrl.getBySkill);

export default router;
