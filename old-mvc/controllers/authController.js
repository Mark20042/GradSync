const User = require("../models/User");
const jwt = require("jsonwebtoken");
const path = require("path");
const { verifyDocument } = require("../utils/ocrService");
const {
  sendVerificationSuccessEmail,
  sendVerificationFailedEmail,
} = require("../utils/emailService");

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "60d",
  });
};

// @desc    Register a new user
exports.register = async (req, res) => {
  const fs = require("fs");

  // Helper to cleanup files
  const cleanupFiles = (files) => {
    if (!files) return;
    try {
      if (files.avatar && files.avatar[0]) fs.unlinkSync(files.avatar[0].path);
      if (files.tor && files.tor[0]) fs.unlinkSync(files.tor[0].path);
      if (files.businessPermit && files.businessPermit[0])
        fs.unlinkSync(files.businessPermit[0].path);
    } catch (err) {
      console.error("File cleanup error:", err.message);
    }
  };

  try {
    const { fullName, email, password, role, degree, companyName } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      cleanupFiles(req.files);
      return res.status(400).json({ message: "User already exists" });
    }

    // Handle file uploads
    let avatarUrl = "";
    let torUrl = "";
    let businessPermitUrl = "";

    if (req.files) {
      if (req.files.avatar) {
        avatarUrl = `${req.protocol}://${req.get("host")}/uploads/${req.files.avatar[0].filename}`;
      }
      if (req.files.tor) {
        torUrl = `${req.protocol}://${req.get("host")}/uploads/${req.files.tor[0].filename}`;
      }
      if (req.files.businessPermit) {
        businessPermitUrl = `${req.protocol}://${req.get("host")}/uploads/${req.files.businessPermit[0].filename}`;
      }
    }

    const isEmployer = role === "employer";

    // Create new user (initially unverified)
    const user = await User.create({
      fullName,
      email,
      password,
      role,
      degree,
      companyName,
      avatar: avatarUrl,
      companyLogo: isEmployer ? avatarUrl : "",
      tor: torUrl,
      businessPermit: businessPermitUrl,
      verified: false,
      verificationStatus: "pending",
      verificationMessage: "Your document is currently being reviewed.",
    });

    // Run OCR asynchronously in the background so the user doesn't wait
    const runBackgroundVerification = async () => {
      try {
        let ocrResult = { verified: false, message: "No document uploaded." };

        if (isEmployer && req.files && req.files.businessPermit) {
          const filePath = req.files.businessPermit[0].path;
          console.log(
            `🔍 Running OCR verification in background on Business Permit for ${fullName}...`,
          );
          ocrResult = await verifyDocument(filePath, "businessPermit");
        } else if (!isEmployer && req.files && req.files.tor) {
          const filePath = req.files.tor[0].path;
          console.log(
            `🔍 Running OCR verification in background on TOR for ${fullName}...`,
          );
          ocrResult = await verifyDocument(filePath, "tor");
        }

        console.log(`📄 OCR Result for ${fullName}:`, ocrResult);

        if (ocrResult.verified) {
          // Update user status to verified
          user.verified = true;
          user.verificationStatus = "verified";
          user.verificationMessage = ocrResult.message;
          await user.save();

          sendVerificationSuccessEmail(
            user.email,
            user.fullName,
            user.role,
          ).catch((err) =>
            console.error("Email notification failed:", err.message),
          );
        } else {
          // Document failed OCR, delete the user and uploaded files
          console.log(`🗑️ OCR Failed. Deleting unverified user: ${user.email}`);
          await User.findByIdAndDelete(user._id);
          if (req.files) cleanupFiles(req.files);

          sendVerificationFailedEmail(
            user.email,
            user.fullName,
            user.role,
          ).catch((err) =>
            console.error("Failed email notification error:", err.message),
          );
        }
      } catch (err) {
        console.error("Background verification error:", err.message);
      }
    };

    // Kick off verification without awaiting it
    runBackgroundVerification();

    // Immediately respond to the client so they aren't waiting for the OCR
    res.status(201).json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      verified: false,
      verificationPending: true,
      message:
        "Registration successful. Please wait for an email to get verified.",
    });
  } catch (error) {
    if (req.files) cleanupFiles(req.files);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Login user
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check for user email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    if (user.password !== password) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Check if user is verified (applies to both graduates and employers, but not admins)
    if (!user.verified && !user.isAdmin) {
      return res.status(403).json({
        message:
          "Your account is not yet verified. Please upload a valid document to complete verification.",
        isUnverified: true,
      });
    }

    // Generate JWT token
    const token = generateToken(user._id);

    // Automatically check if a graduate has completed their profile (i.e. they inputted their university)
    const isProfileComplete =
      user.role === "graduate"
        ? !!(user.university && user.university.trim() !== "")
        : user.isProfileComplete || true;

    res.status(200).json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      degree: user.degree,
      avatar: user.avatar || "",
      companyName: user.companyName || "",
      companyLogo: user.companyLogo || "",
      companyDescription: user.companyDescription || "",
      resume: user.resume || "",
      isAdmin: user.isAdmin,
      verified: user.verified,
      isProfileComplete,
      token,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user profile
exports.GetMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Setup profile for graduates
// @route   PUT /api/auth/setup-profile-grad
// @access  Private (graduates only)
exports.setupProfileGrad = async (req, res) => {
  try {
    const {
      university,
      graduationYear,
      portfolio,
      linkedin,
      github,
      resume,
      skills,
      degree,
      bio,
      address,
      phone,
      website,
      major,
      experiences,
      internships,
      education,
      awards,
      certifications,
      projects,
      languages,
      jobPreferences,
    } = req.body;

    // only graduates can update this
    if (req.user.role !== "graduate") {
      return res
        .status(403)
        .json({ message: "Only graduates can update this profile" });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        degree,
        university,
        graduationYear,
        portfolio,
        linkedin,
        github,
        resume,
        skills,
        bio,
        address,
        phone,
        website,
        major,
        experiences,
        internships,
        education,
        awards,
        certifications,
        projects,
        languages,
        jobPreferences,
        isProfileComplete: true,
      },
      { new: true },
    ).select("-password");

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
