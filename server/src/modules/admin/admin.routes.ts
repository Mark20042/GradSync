import { Router } from "express";
import { protect } from "../../shared/middleware/auth.middleware.js";
import { admin } from "../../shared/middleware/admin.middleware.js";
import { upload } from "../../shared/middleware/upload.middleware.js";
import * as adminController from "./admin.controller.js";

const router = Router();

// All routes are protected and require admin role
router.use(protect as any);
router.use(admin as any);

router.get("/analytics", adminController.getAnalytics);
router.post("/upload", upload.single("image"), adminController.uploadImage);

// User Routes
router.get("/users", adminController.getAllUsers);
router.post("/users", adminController.createUser);
router.put("/users/:id", adminController.updateUser);
router.delete("/users/:id", adminController.deleteUser);
router.get("/users/:id/saved-jobs", adminController.getUserSavedJobs);

// Job Routes
router.get("/jobs", adminController.getAllJobs);
router.post("/jobs", adminController.createJob);
router.put("/jobs/:id", adminController.updateJob);
router.delete("/jobs/:id", adminController.deleteJob);

// Report Routes
router.get("/reports", adminController.getReports);

// FAQ Routes
router.get("/faqs", adminController.getFAQs);
router.post("/faqs", adminController.createFAQ);
router.put("/faqs/:id", adminController.updateFAQ);
router.delete("/faqs/:id", adminController.deleteFAQ);

// Job FAQ Routes
router.get("/job-faqs", adminController.getJobFAQs);
router.post("/job-faqs", adminController.createJobFAQ);
router.put("/job-faqs/:id", adminController.updateJobFAQ);
router.delete("/job-faqs/:id", adminController.deleteJobFAQ);

// Employer Settings Routes
router.get("/employer-settings", adminController.getAllEmployerSettings);
router.post("/employer-settings", adminController.createEmployerSettings);
router.put("/employer-settings/:id", adminController.updateEmployerSettings);

export default router;
