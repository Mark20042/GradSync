const User = require("../models/User");
const jwt = require("jsonwebtoken");

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "60d",
  });
};

// @desc    Register a new user
// @desc    Register a new user
exports.register = async (req, res) => {
  const fs = require("fs");

  // Helper to cleanup files
  const cleanupFiles = (files) => {
    if (!files) return;
    if (files.avatar) fs.unlinkSync(files.avatar[0].path);
    if (files.tor) fs.unlinkSync(files.tor[0].path);
    if (files.businessPermit) fs.unlinkSync(files.businessPermit[0].path);
  };

  try {
    const { fullName, email, password, role, degree, companyName, avatar } =
      req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      cleanupFiles(req.files); // Cleanup if user exists
      return res.status(400).json({ message: "User already exists" });
    }

    // Handle file uploads
    let avatarUrl = "";
    let torUrl = "";
    let businessPermitUrl = "";

    if (req.files) {
      if (req.files.avatar) {
        avatarUrl = `${req.protocol}://${req.get("host")}/uploads/${req.files.avatar[0].filename
          }`;
      }
      if (req.files.tor) {
        torUrl = `${req.protocol}://${req.get("host")}/uploads/${req.files.tor[0].filename
          }`;
      }
      if (req.files.businessPermit) {
        businessPermitUrl = `${req.protocol}://${req.get("host")}/uploads/${req.files.businessPermit[0].filename
          }`;
      }
    }

    // Determine approval status based on role
    const isEmployer = role === "employer";

    // Create new user
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
      // Employer-specific approval fields
      isApproved: !isEmployer, // Graduates auto-approved, employers need approval
      approvalStatus: isEmployer ? "pending" : "approved",
    });

    // For employers, don't issue token - they need admin approval first
    if (isEmployer) {
      return res.status(201).json({
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        companyName: user.companyName || "",
        pendingApproval: true,
        message: "Registration successful! Your account is pending admin approval. We will notify you via email once approved.",
      });
    }

    // For graduates, issue token immediately
    const token = generateToken(user._id);

    res.status(201).json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      degree: user.degree,
      companyName: user.companyName || "",
      companyLogo: user.companyLogo || "",
      companyDescription: user.companyDescription || "",
      resume: user.resume || "",
      isAdmin: user.isAdmin,
      token,
    });
  } catch (error) {
    if (req.files) cleanupFiles(req.files); // Cleanup on server error
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

    // Check if employer is approved
    if (user.role === "employer" && !user.isApproved) {
      if (user.approvalStatus === "rejected") {
        return res.status(403).json({
          message: "Your account has been rejected.",
          rejectionReason: user.rejectionReason || "No reason provided.",
          isRejected: true,
        });
      }
      return res.status(403).json({
        message: "Your account is pending admin approval. We will notify you via email once approved.",
        pendingApproval: true,
      });
    }

    // Generate JWT token
    const token = generateToken(user._id);

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
      isApproved: user.isApproved,
      approvalStatus: user.approvalStatus,
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
      { new: true }
    ).select("-password");

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
