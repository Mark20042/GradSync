// authRoutes.js
const express = require("express");
const {
  register,
  login,
  GetMe,
  setupProfileGrad,
} = require("../controllers/authController");
const { protect } = require("../middlewares/authMiddleware");
const upload = require("../middlewares/uploadMiddleware");
const User = require("../models/User"); // Import User model

const router = express.Router();

router.post(
  "/register",
  upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "tor", maxCount: 1 },
    { name: "businessPermit", maxCount: 1 },
  ]),
  register
);
router.put("/setup-profile-grad", protect, setupProfileGrad);
router.post("/login", login);
router.get("/me", protect, GetMe);

router.post(
  "/upload-image",
  protect,
  upload.single("image"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const imageUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename
        }`;

      // Get current user to check if they have an existing avatar
      const currentUser = await User.findById(req.user.id);

      // Delete previous avatar file if exists
      if (currentUser.avatar) {
        const fs = require("fs");
        const path = require("path");
        const previousFilename = currentUser.avatar.split("/").pop();
        const previousFilePath = path.join(
          __dirname,
          "../uploads",
          previousFilename
        );

        if (fs.existsSync(previousFilePath)) {
          fs.unlinkSync(previousFilePath);
        }
      }

      // Update user's avatar in database
      currentUser.avatar = imageUrl;
      await currentUser.save();

      res.status(200).json({
        imageUrl: imageUrl,
        avatarUrl: imageUrl,
        message: "Avatar updated successfully",
      });
    } catch (error) {
      console.error("Error uploading image:", error);
      res.status(500).json({ message: "Error uploading image" });
    }
  }
);

// In your authRoutes.js or userRoutes.js
router.post(
  "/upload-resume",
  protect,
  upload.single("resume"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const resumeUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename
        }`;

      // Update user's resume in database
      const currentUser = await User.findById(req.user.id);

      // Delete previous resume if exists
      if (currentUser.resume) {
        const fs = require("fs");
        const path = require("path");
        const previousFilename = currentUser.resume.split("/").pop();
        const previousFilePath = path.join(
          __dirname,
          "../uploads",
          previousFilename
        );

        if (fs.existsSync(previousFilePath)) {
          fs.unlinkSync(previousFilePath);
        }
      }

      currentUser.resume = resumeUrl;
      await currentUser.save();

      res.status(200).json({
        resumeUrl: resumeUrl,
        message: "Resume updated successfully",
      });
    } catch (error) {
      console.error("Error uploading resume:", error);
      res.status(500).json({ message: "Error uploading resume" });
    }
  }
);

module.exports = router;
