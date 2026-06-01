import { Router } from "express";
import * as ctrl from "@/controllers/interview-role.controller.js";
import { authenticationMiddleware } from "@/middlewares/auth.middleware.js";

const router = Router();

router.get("/all-questions", authenticationMiddleware, ctrl.getAllQuestions);
router.get("/", ctrl.getAll);
router.post("/", authenticationMiddleware, ctrl.create);
router.put("/:id", authenticationMiddleware, ctrl.update);
router.delete("/:id", authenticationMiddleware, ctrl.remove);
router.post("/:id/questions", authenticationMiddleware, ctrl.addQuestion);
router.put("/:id/questions/:questionId", authenticationMiddleware, ctrl.updateQuestion);
router.delete("/:id/questions/:questionId", authenticationMiddleware, ctrl.deleteQuestion);

export default router;
