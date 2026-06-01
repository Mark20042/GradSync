import { Router } from "express";
import { getMessages, sendMessage } from "@/controllers/message.controller.js";
import { authenticationMiddleware } from "@/middlewares/auth.middleware.js";

const router = Router();

router.get("/:conversationId", authenticationMiddleware, getMessages as any);
router.post("/", authenticationMiddleware, sendMessage as any);

export default router;
