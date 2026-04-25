const express = require("express");

const router = express.Router();
const { protect } = require("../middlewares/authMiddleware");

const {
  saveJob,
  unsaveJob,
  getSavedJobs,
} = require("../controllers/savedJobController");

router.post("/:jobId", protect, saveJob);
router.delete("/:jobId", protect, unsaveJob);
router.get("/my", protect, getSavedJobs);

module.exports = router;
