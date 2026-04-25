const express = require("express");

const {
  updateProfile,
  deleteAccount,
  deleteResume,
  getPublicProfile,
  getAllEmployers,
} = require("../controllers/userController");

const { protect } = require("../middlewares/authMiddleware");

const router = express.Router();

//protected routes
router.put("/profile", protect, updateProfile);
router.delete("/resume", protect, deleteResume);
router.delete("/profile", protect, deleteAccount);

//Public routes
router.get("/employers", getAllEmployers);
router.get("/:id", getPublicProfile);

module.exports = router;
