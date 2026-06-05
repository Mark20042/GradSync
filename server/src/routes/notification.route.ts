import { Router } from "express";
import { getNotifications, markAsRead, markAllAsRead, savePushSubscription } from "@/controllers/notification.controller.js";
import { authenticationMiddleware } from "@/middlewares/auth.middleware.js";

const router = Router();

router.get("/", authenticationMiddleware, getNotifications as any);
router.post("/push-subscribe", authenticationMiddleware, savePushSubscription as any);
router.put("/read-all", authenticationMiddleware, markAllAsRead as any);
router.put("/:id/read", authenticationMiddleware, markAsRead as any);

export default router;
