import { Router } from "express";
import * as ctrl from "@/controllers/employer.controller.js";
import { authenticationMiddleware } from "@/middlewares/auth.middleware.js";

const router = Router();

router.get("/settings", authenticationMiddleware, ctrl.getSettings as any);
router.put("/settings", authenticationMiddleware, ctrl.updateSettings as any);
router.get("/faqs", authenticationMiddleware, ctrl.getFaqs as any);
router.post("/faqs", authenticationMiddleware, ctrl.createFaq as any);
router.put("/faqs/:id", authenticationMiddleware, ctrl.updateFaq as any);
router.delete("/faqs/:id", authenticationMiddleware, ctrl.deleteFaq as any);
router.get("/:employerId/public-faqs", authenticationMiddleware, ctrl.getPublicFaqs as any);

export default router;
