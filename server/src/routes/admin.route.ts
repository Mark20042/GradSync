import { Router } from "express";
import { authenticationMiddleware, adminMiddleware } from "@/middlewares/auth.middleware.js";
import { upload } from "@/middlewares/upload.middleware.js";
import * as adminController from "@/controllers/admin.controller.js";

const router = Router();

// All routes are protected and require admin role
router.use(authenticationMiddleware);
router.use(adminMiddleware as any);

router.get("/analytics", adminController.getAnalytics);
router.post("/upload", upload.single("image"), adminController.uploadImage);
router.get("/users", adminController.getAllUsers);
router.get("/candidates", adminController.getCandidates);
router.post("/users", adminController.createUser);
router.put("/users/:id", adminController.updateUser);
router.delete("/users/:id", adminController.deleteUser);
router.get("/users/:id/saved-jobs", adminController.getUserSavedJobs);
router.get("/applications", adminController.getAllApplications);
router.delete("/applications/:id", adminController.deleteApplication);
router.get("/jobs", adminController.getAllJobs);
router.post("/jobs", adminController.createJob);
router.put("/jobs/:id", adminController.updateJob);
router.delete("/jobs/:id", adminController.deleteJob);
router.get("/reports", adminController.getReports);
router.get("/faqs", adminController.getFAQs);
router.post("/faqs", adminController.createFAQ);
router.put("/faqs/:id", adminController.updateFAQ);
router.delete("/faqs/:id", adminController.deleteFAQ);
router.get("/job-faqs", adminController.getJobFAQs);
router.post("/job-faqs", adminController.createJobFAQ);
router.put("/job-faqs/:id", adminController.updateJobFAQ);
router.delete("/job-faqs/:id", adminController.deleteJobFAQ);
router.get("/employer-settings", adminController.getAllEmployerSettings);
router.post("/employer-settings", adminController.createEmployerSettings);
router.put("/employer-settings/:id", adminController.updateEmployerSettings);
router.get("/ai-feedback", adminController.getAIFeedbacks);
router.delete("/ai-feedback/:id", adminController.deleteAIFeedback);

export default router;
