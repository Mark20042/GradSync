const express = require("express");
const router = express.Router();
const { getMessages } = require("../controllers/messageController");
const { protect } = require("../middlewares/authMiddleware");

// @route   GET /api/messages/:conversationId
// @desc    Get all messages for a specific conversation
// @access  Private
router.get("/:conversationId", protect, getMessages);

module.exports = router;
