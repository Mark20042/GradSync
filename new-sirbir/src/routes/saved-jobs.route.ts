import { Router } from "express";
import { saveJob, unsaveJob, getMySavedJobs } from "@/controllers/saved-jobs.controller.js";
import { authenticationMiddleware } from "@/middlewares/auth.middleware.js";

const router = Router();

router.post("/:jobId", authenticationMiddleware, saveJob as any);
router.delete("/:jobId", authenticationMiddleware, unsaveJob as any);
router.get("/my", authenticationMiddleware, getMySavedJobs as any);

export default router;
