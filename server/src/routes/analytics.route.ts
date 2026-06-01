import { Router } from "express";
import { getAnalyticsOverview } from "@/controllers/analytics.controller.js";
import { authenticationMiddleware } from "@/middlewares/auth.middleware.js";

const router = Router();

router.get("/overview", authenticationMiddleware, getAnalyticsOverview as any);

export default router;
