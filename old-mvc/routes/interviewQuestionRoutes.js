const express = require("express");
const router = express.Router();
const {
  createQuestion,
  getQuestions,
  updateQuestion,
  deleteQuestion,
} = require("../controllers/interviewQuestionController");
const { protect } = require("../middlewares/authMiddleware");
const { admin } = require("../middlewares/adminMiddleware");

// @route   /api/interview-questions
router
  .route("/")
  .post(protect, admin, createQuestion)
  .get(protect, getQuestions); // allow applicants/employers to access if needed (or adjust depending on requirement)

// @route   /api/interview-questions/:id
router
  .route("/:id")
  .put(protect, admin, updateQuestion)
  .delete(protect, admin, deleteQuestion);

module.exports = router;
