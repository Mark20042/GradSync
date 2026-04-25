const fs = require("fs");
const path = require("path");

// --- 1. Import ALL related models ---
const User = require("../models/User");
const Job = require("../models/Job");
const Application = require("../models/Application");
const Conversation = require("../models/Conversation");
const Message = require("../models/Message");
const SavedJob = require("../models/SavedJob");
const Analytics = require("../models/Analytics"); // Assuming this is tied to jobs

// @desc    Update user profile
exports.updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update allowed fields - include all fields from the schema
    const {
      fullName,
      email,
      avatar,
      bio,
      phone,
      address,
      website,
      // Graduate fields
      degree,
      university,
      graduationYear,
      major,
      portfolio,
      linkedin,
      github,
      experiences,
      internships,
      education,
      skills,
      languages,
      awards,
      certifications,
      projects,
      jobPreferences,
      // Employer fields
      companyName,
      companyLogo,
      companyDescription,
      resume,
    } = req.body || {};

    // Update basic profile fields
    user.fullName = fullName || user.fullName;
    user.email = email || user.email;
    user.avatar = avatar || user.avatar;
    user.bio = bio !== undefined ? bio : user.bio;
    user.phone = phone !== undefined ? phone : user.phone;
    user.address = address !== undefined ? address : user.address;
    user.website = website !== undefined ? website : user.website;
    user.resume = resume !== undefined ? resume : user.resume;

    // Update graduate-specific fields
    if (user.role === "graduate") {
      user.degree = degree || user.degree;
      user.university = university !== undefined ? university : user.university;
      user.graduationYear =
        graduationYear !== undefined ? graduationYear : user.graduationYear;
      user.major = major !== undefined ? major : user.major;
      user.portfolio = portfolio !== undefined ? portfolio : user.portfolio;
      user.linkedin = linkedin !== undefined ? linkedin : user.linkedin;
      user.github = github !== undefined ? github : user.github;

      // Update arrays and objects
      if (experiences !== undefined) user.experiences = experiences;
      if (internships !== undefined) user.internships = internships;
      if (education !== undefined) user.education = education;
      if (skills !== undefined) user.skills = skills;
      if (languages !== undefined) user.languages = languages;
      if (awards !== undefined) user.awards = awards;
      if (certifications !== undefined) user.certifications = certifications;
      if (projects !== undefined) user.projects = projects;
      if (jobPreferences !== undefined) user.jobPreferences = jobPreferences;
    }

    // Update employer-specific fields
    if (user.role === "employer") {
      user.companyName = companyName || user.companyName;
      user.companyLogo =
        companyLogo !== undefined ? companyLogo : user.companyLogo;
      user.companyDescription =
        companyDescription !== undefined
          ? companyDescription
          : user.companyDescription;
    }

    // Mark profile as complete if graduate has filled required fields
    if (user.role === "graduate") {
      user.isProfileComplete = Boolean(
        user.university &&
        user.graduationYear &&
        user.degree &&
        user.skills.length > 0
      );
    }

    await user.save();

    // Return updated user data
    const updatedUser = await User.findById(req.user._id).select("-password");
    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete resume file (jobseeker only)
exports.deleteResume = async (req, res) => {
  try {
    const { resumeUrl } = req.body;

    //extract filename from URL
    const fileName = resumeUrl.split("/").pop();

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (user.role !== "graduate") {
      return res
        .status(403)
        .json({ message: "Only jobseekers can delete resumes" });
    }

    // Delete the file from the server
    const filePath = path.join(__dirname, "../uploads", fileName);

    // Check if the file exists
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath); // Delete the file
    }

    // set the users resume to an empty string
    user.resume = "";
    await user.save();

    res.status(200).json({ message: "Resume deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete user account
exports.deleteAccount = async (req, res) => {
  try {
    // --- 1. Find User ---
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const userId = user._id;

    // --- 2. Delete User's Files ---
    // Helper function to delete files from /uploads
    const deleteFile = (fileUrl) => {
      if (!fileUrl) return;
      try {
        const fileName = fileUrl.split("/").pop();
        const filePath = path.join(__dirname, "../uploads", fileName);
        console.log(`Checking file at: ${filePath}`);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
          console.log(`Deleted file: ${fileName}`);
        } else {
          console.log(`File not found: ${fileName}`);
        }
      } catch (err) {
        console.error(`Failed to delete file: ${fileUrl}`, err);
      }
    };

    console.log(`Deleting account for user: ${user._id}`);
    console.log(`Resume URL to delete: ${user.resume}`);

    deleteFile(user.avatar);
    if (user.role === "graduate") {
      deleteFile(user.resume);
      deleteFile(user.tor);
    }
    if (user.role === "employer") {
      deleteFile(user.companyLogo);
      deleteFile(user.businessPermit);
    }

    // --- 3. Cascade Delete (Role-based) ---
    if (user.role === "graduate") {
      // Delete all applications submitted by this graduate
      await Application.deleteMany({ user: userId });
      // Delete all jobs saved by this graduate
      await SavedJob.deleteMany({ user: userId });
    }

    if (user.role === "employer") {
      // Find all jobs posted by this employer
      const jobs = await Job.find({ user: userId }).select("_id");
      const jobIds = jobs.map((job) => job._id);

      // Delete all jobs posted by this employer
      await Job.deleteMany({ _id: { $in: jobIds } });
      // Delete all applications submitted TO these jobs
      await Application.deleteMany({ job: { $in: jobIds } });
      // Delete all SavedJob entries from other users for these jobs
      await SavedJob.deleteMany({ job: { $in: jobIds } });
      // Delete all analytics data for these jobs
      await Analytics.deleteMany({ job: { $in: jobIds } });
    }

    // --- 4. Cascade Delete (Chat Data - All Roles) ---
    // Find all conversations the user is a part of
    const conversations = await Conversation.find({
      members: { $in: [userId] },
    });
    const conversationIds = conversations.map((c) => c._id);

    // Delete all messages within those conversations
    await Message.deleteMany({ conversationId: { $in: conversationIds } });
    // Delete all the conversations themselves
    await Conversation.deleteMany({ _id: { $in: conversationIds } });

    // --- 5. Delete the User ---
    await User.findByIdAndDelete(userId);

    res
      .status(200)
      .json({
        message: "Account and all associated data deleted successfully",
      });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get public profile (jobseeker or employer)
exports.getPublicProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select(
      "-password -isAdmin"
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// @desc    Get all public employers
exports.getAllEmployers = async (req, res) => {
  try {
    const employers = await User.find({ role: 'employer' })
      .select('companyName companyLogo companyDescription email website address')
      .sort({ createdAt: -1 });
    res.status(200).json(employers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
