import { Router } from "express";
import * as ctrl from "@/controllers/interview-question.controller.js";
import { authenticationMiddleware } from "@/middlewares/auth.middleware.js";

const router = Router();

router.get("/", authenticationMiddleware, ctrl.getAll);
router.post("/", authenticationMiddleware, ctrl.create);
router.put("/:id", authenticationMiddleware, ctrl.update);
router.delete("/:id", authenticationMiddleware, ctrl.remove);

export default router;
