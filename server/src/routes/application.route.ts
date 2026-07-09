import { Router } from "express";
import { applyToJob, getMyApplications, getApplicationsByJob, getApplicationById, updateApplicationStatus, terminateApplication, reviewResignationRequest } from "@/controllers/application.controller.js";
import { authenticationMiddleware } from "@/middlewares/auth.middleware.js";

const router = Router();

router.post("/:jobId", authenticationMiddleware, applyToJob as any);
router.get("/my", authenticationMiddleware, getMyApplications as any);
router.get("/job/:jobId", authenticationMiddleware, getApplicationsByJob as any);
router.get("/:id", authenticationMiddleware, getApplicationById as any);
router.put("/:id/status", authenticationMiddleware, updateApplicationStatus as any);
router.put("/:id/terminate", authenticationMiddleware, terminateApplication as any);
router.post("/:id/resignation-request", authenticationMiddleware, reviewResignationRequest as any);

export default router;
