import { Router } from "express";
import { createJob, getAllJobs, getRecommendedJobs, getEmployerJobs, getJobById, updateJob, deleteJob, toggleCloseJob } from "@/controllers/job.controller.js";
import { authenticationMiddleware } from "@/middlewares/auth.middleware.js";

const router = Router();

router.post("/", authenticationMiddleware, createJob as any);
router.get("/", getAllJobs);
router.get("/recommended", authenticationMiddleware, getRecommendedJobs as any);
router.get("/get-jobs-employer", authenticationMiddleware, getEmployerJobs as any);
router.get("/:id", getJobById);
router.put("/:id", authenticationMiddleware, updateJob as any);
router.delete("/:id", authenticationMiddleware, deleteJob as any);
router.put("/:id/toggle-close", authenticationMiddleware, toggleCloseJob as any);

export default router;
