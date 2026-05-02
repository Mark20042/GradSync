import { Router } from "express";
import { updateProfile, deleteProfile, deleteResume, getEmployers, getUserById } from "@/controllers/user.controller.js";
import { authenticationMiddleware } from "@/middlewares/auth.middleware.js";

const router = Router();

router.put("/profile", authenticationMiddleware, updateProfile as any);
router.delete("/profile", authenticationMiddleware, deleteProfile as any);
router.delete("/resume", authenticationMiddleware, deleteResume as any);
router.get("/employers", getEmployers);
router.get("/:id", getUserById);

export default router;
