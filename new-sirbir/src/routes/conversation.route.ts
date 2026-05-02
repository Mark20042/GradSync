import { Router } from "express";
import { createConversation, getConversations } from "@/controllers/conversation.controller.js";
import { authenticationMiddleware } from "@/middlewares/auth.middleware.js";

const router = Router();

router.post("/", authenticationMiddleware, createConversation as any);
router.get("/", authenticationMiddleware, getConversations as any);

export default router;
