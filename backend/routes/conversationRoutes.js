const express = require("express");
const router = express.Router();

const {
  findOrCreateConversation,
  getConversationsForUser,
} = require("../controllers/conversationController");

const { protect } = require("../middlewares/authMiddleware");

// @route   POST /api/conversations
// @desc    Find or create a new conversation about a job
// @access  Private

router.post("/", protect, findOrCreateConversation);

// @route   GET /api/conversations
// @desc    Get all conversations for the logged-in user
// @access  Private

router.get("/", protect, getConversationsForUser);

module.exports = router;
