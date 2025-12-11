const express = require("express");
const router = express.Router();
const { checkSuitability } = require("../controllers/aiController");
const { protect } = require("../middlewares/authMiddleware");

router.post("/suitability", protect, checkSuitability);
const { generateSummary, scanForMatches } = require("../controllers/aiController");
router.post("/summary", protect, generateSummary);
router.post("/scan-matches", protect, scanForMatches);

const { askMentor } = require("../controllers/aiMentorController");
router.post("/mentor", protect, askMentor);

module.exports = router;
