import { Router } from "express";
import { register, login, logout, getMe, setupProfileGrad, uploadImage, uploadResume } from "@/controllers/auth.controller.js";
import { authenticationMiddleware } from "@/middlewares/auth.middleware.js";
import { upload } from "@/middlewares/upload.middleware.js";

const router = Router();

router.post("/register", upload.fields([
  { name: "avatar", maxCount: 1 },
  { name: "tor", maxCount: 1 },
  { name: "businessPermit", maxCount: 1 },
]), register);
router.post("/login", login);
router.post("/logout", logout);
router.get("/me", authenticationMiddleware, getMe as any);
router.put("/setup-profile-grad", authenticationMiddleware, setupProfileGrad as any);
router.post("/upload-image", authenticationMiddleware, upload.single("image"), uploadImage as any);
router.post("/upload-resume", authenticationMiddleware, upload.single("resume"), uploadResume as any);

export default router;
