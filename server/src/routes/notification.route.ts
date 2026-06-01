import { Router } from "express";
import { getNotifications, markAsRead } from "@/controllers/notification.controller.js";
import { authenticationMiddleware } from "@/middlewares/auth.middleware.js";

const router = Router();

router.get("/", authenticationMiddleware, getNotifications as any);
router.put("/:id/read", authenticationMiddleware, markAsRead as any);

export default router;
