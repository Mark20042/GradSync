const express = require("express");
const router = express.Router();
const interviewController = require("../controllers/interviewController");
const { protect } = require("../middlewares/authMiddleware");
const { admin } = require("../middlewares/adminMiddleware");

// POST /api/interviews/evaluate (Graduate submits STT answers for AI evaluation)
router.post("/evaluate", protect, interviewController.evaluateInterview);

// POST /api/interviews/save (Legacy - for Python Agent or direct save)
router.post("/save", interviewController.saveInterviewResult);

// GET /api/interviews/user (My interviews - Graduate)
router.get("/user", protect, interviewController.getUserInterviews);

// GET /api/interviews/all-scores (Admin - all evaluated interviews)
router.get("/all-scores", protect, admin, interviewController.getAllInterviewScores);

// GET /api/interviews/graduate/:userId (Employer views a graduate's scores)
router.get("/graduate/:userId", protect, interviewController.getGraduateInterviews);

// GET /api/interviews (All - Legacy for Employer Dashboard)
router.get("/", protect, interviewController.getAllInterviews);

// GET /api/interviews/:id (Detail)
router.get("/:id", protect, interviewController.getInterviewById);

// DELETE /api/interviews/:id (Delete interview record - Admin)
router.delete("/:id", protect, admin, interviewController.deleteInterview);

module.exports = router;
