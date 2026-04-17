const express = require("express");
const router = express.Router();
const {
  getInterviewRoles,
  getFlatQuestions,
  createInterviewRole,
  updateInterviewRole,
  deleteInterviewRole,
  addQuestionToRole,
  updateQuestionInRole,
  deleteQuestionFromRole,
} = require("../controllers/interviewRoleController");

const { protect } = require("../middlewares/authMiddleware");
const { admin } = require("../middlewares/adminMiddleware");

// Flattened Questions for Interview Room
router.route("/all-questions").get(getFlatQuestions);

// Job Roles
router
  .route("/")
  .get(getInterviewRoles)
  .post(protect, admin, createInterviewRole);

router
  .route("/:id")
  .put(protect, admin, updateInterviewRole)
  .delete(protect, admin, deleteInterviewRole);

// Questions inside Job Roles
router.route("/:id/questions").post(protect, admin, addQuestionToRole);

router
  .route("/:id/questions/:questionId")
  .put(protect, admin, updateQuestionInRole)
  .delete(protect, admin, deleteQuestionFromRole);

module.exports = router;
