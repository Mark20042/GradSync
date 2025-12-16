const express = require("express");
const router = express.Router();
const {
    getAnalytics,
    getAllUsers,
    getPendingEmployers,
    approveEmployer,
    rejectEmployer,
    deleteUser,
    updateUser,
    getUserSavedJobs,
    getAllJobs,
    deleteJob,
    updateJob,
    getReports,
    getFAQs,
    createFAQ,
    updateFAQ,
    deleteFAQ,
    getAllEmployerSettings,
    createEmployerSettings,
    updateEmployerSettings,
    getJobFAQs,
    createJobFAQ,
    updateJobFAQ,
    deleteJobFAQ,
    createUser,
    createJob,
    uploadImage,
} = require("../controllers/adminController");
const { admin } = require("../middlewares/adminMiddleware");
const { protect } = require("../middlewares/authMiddleware");
const upload = require("../middlewares/uploadMiddleware");

// All routes are protected and require admin role
router.use(protect); // Ensure user is logged in
router.use(admin); // Ensure user is admin

router.get("/analytics", getAnalytics);
router.post("/upload", upload.single("image"), uploadImage);

// User Routes
router.get("/users", getAllUsers);
router.post("/users", createUser);
router.put("/users/:id", updateUser);
router.delete("/users/:id", deleteUser);
router.get("/users/:id/saved-jobs", getUserSavedJobs);

// Employer Approval Routes
router.get("/pending-employers", getPendingEmployers);
router.put("/employers/:id/approve", approveEmployer);
router.put("/employers/:id/reject", rejectEmployer);

// Job Routes
router.get("/jobs", getAllJobs);
router.post("/jobs", createJob);
router.put("/jobs/:id", updateJob);
router.delete("/jobs/:id", deleteJob);

// Report Routes
router.get("/reports", getReports);

// FAQ Routes
router.get("/faqs", getFAQs);
router.post("/faqs", createFAQ);
router.put("/faqs/:id", updateFAQ);
router.delete("/faqs/:id", deleteFAQ);
router.get("/job-faqs", getJobFAQs);
router.post("/job-faqs", createJobFAQ);
router.put("/job-faqs/:id", updateJobFAQ);
router.delete("/job-faqs/:id", deleteJobFAQ);

// Employer Settings Routes
router.get("/employer-settings", getAllEmployerSettings);
router.post("/employer-settings", createEmployerSettings);
router.put("/employer-settings/:id", updateEmployerSettings);

module.exports = router;
