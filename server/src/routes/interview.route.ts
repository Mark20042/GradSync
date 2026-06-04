import { Router } from "express";
import * as ctrl from "@/controllers/interview.controller.js";
import { authenticationMiddleware, adminMiddleware } from "@/middlewares/auth.middleware.js";

const router = Router();

router.post("/evaluate", authenticationMiddleware, ctrl.evaluate as any);
router.post("/save", ctrl.save);
router.get("/user", authenticationMiddleware, ctrl.getUserInterviews as any);
router.get("/all-scores", authenticationMiddleware, adminMiddleware as any, ctrl.getAllScores);
router.get("/graduate/:userId", authenticationMiddleware, ctrl.getGraduateInterviews);
router.get("/", authenticationMiddleware, ctrl.getInterviewAll);
router.get("/deepgram-token", authenticationMiddleware, ctrl.getDeepgramToken as any);
router.get("/:id", authenticationMiddleware, ctrl.getById);
router.delete("/:id", authenticationMiddleware, adminMiddleware as any, ctrl.remove);
router.post("/chat", authenticationMiddleware, ctrl.chat as any);

export default router;
