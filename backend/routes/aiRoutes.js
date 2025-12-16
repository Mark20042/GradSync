const express = require("express");
const router = express.Router();
const { checkSuitability } = require("../controllers/aiController");
const { protect } = require("../middlewares/authMiddleware");

router.post("/suitability", protect, checkSuitability);
const { generateSummary, scanForMatches, checkCandidateSuitability } = require("../controllers/aiController");
router.post("/summary", protect, generateSummary);
router.post("/scan-matches", protect, scanForMatches);
router.post("/candidate-suitability", protect, checkCandidateSuitability);

const { askMentor } = require("../controllers/aiMentorController");
router.post("/mentor", protect, askMentor);

module.exports = router;
