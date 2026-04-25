const express = require("express");
const router = express.Router();
const assessmentController = require("../controllers/assessmentController");
const { protect } = require("../middlewares/authMiddleware");

// --- Admin Routes (more specific paths first) ---
// GET /api/assessments (List all assessments) - MUST be before /:skill
router.get("/", protect, assessmentController.getAllAssessments);

// GET /api/assessments/detail/:id (Get single assessment by ID)
router.get("/detail/:id", protect, assessmentController.getAssessmentById);

// POST /api/assessments (Create new assessment)
router.post("/", protect, assessmentController.createAssessment);

// POST /api/assessments/submit (Submit answers)
router.post("/submit", protect, assessmentController.submitAssessment);

// PUT /api/assessments/:id (Update assessment)
router.put("/:id", protect, assessmentController.updateAssessment);

// DELETE /api/assessments/:id (Delete assessment)
router.delete("/:id", protect, assessmentController.deleteAssessment);

// POST /api/assessments/:skill/questions (Add question)
router.post("/:skill/questions", protect, assessmentController.addQuestion);

// PUT /api/assessments/:assessmentId/questions/:questionId (Update question)
router.put("/:assessmentId/questions/:questionId", protect, assessmentController.updateQuestion);

// DELETE /api/assessments/:assessmentId/questions/:questionId (Delete question)
router.delete("/:assessmentId/questions/:questionId", protect, assessmentController.deleteQuestion);

// GET /api/assessments/:skill/users (Get verified users)
router.get("/:skill/users", protect, assessmentController.getVerifiedUsers);

// DELETE /api/assessments/:skill/users/:userId (Unverify user)
router.delete("/:skill/users/:userId", protect, assessmentController.unverifyUser);

// --- Public/User Routes (catch-all at end) ---
// GET /api/assessments/:skill (Get assessment for taking)
router.get("/:skill", protect, assessmentController.getAssessment);

module.exports = router;
