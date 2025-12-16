const mongoose = require("mongoose");

const experienceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  company: {
    type: String,
    required: true,
  },
  location: String,
  startDate: Date,
  endDate: Date,
  current: {
    type: Boolean,
    default: false,
  },
  description: String,
});

const educationSchema = new mongoose.Schema({
  school: {
    type: String,
    required: true,
  },
  degree: String,
  startDate: Date,
  endDate: Date,
  location: String,
  activities: String,
});

const awardSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  issuer: String,
  date: Date,
  description: String,
});

const certificationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  issuer: String,
  issueDate: Date,
  expirationDate: Date,
  credentialID: String,
  credentialURL: String,
});

const projectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: String,
  url: String,
  startDate: Date,
  endDate: Date,
  technologies: [String],
});

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
    },
    role: {
      type: String,
      required: [true, "Role is required"],
      enum: ["graduate", "employer"],
    },

    // Personal Information
    avatar: String,
    bio: String,
    phone: String,
    address: String,
    website: String,

    // Graduate-specific fields
    degree: {
      type: String,
      required: function () {
        return this.role === "graduate";
      },
    },
    university: { type: String, default: "" },
    graduationYear: { type: Number, default: null },
    major: String,

    // Professional profiles
    tor: { type: String, default: "" }, // Transcript of Records
    verificationStatus: {
      type: String,
      enum: ["pending", "verified", "failed"],
      default: "pending",
    },
    verificationMessage: { type: String, default: "" },
    portfolio: { type: String, default: "" },
    linkedin: { type: String, default: "" },
    github: { type: String, default: "" },

    // Work experience
    experiences: [experienceSchema],
    internships: [experienceSchema],

    // Education (for multiple entries)
    education: [educationSchema],

    // Skills & expertise
    skills: {
      type: [String],
      default: [],
    },
    languages: [
      {
        language: String,
        proficiency: {
          type: String,
          enum: ["Basic", "Conversational", "Fluent", "Native"],
        },
      },
    ],

    // Achievements
    awards: [awardSchema],
    certifications: [certificationSchema],
    projects: [projectSchema],

    // Job preferences
    jobPreferences: {
      desiredJobTitle: String,
      industry: String,
      preferredLocation: String,
      jobType: {
        type: String,
        enum: ["Full-time", "Part-time", "Contract", "Internship", "Remote"],
      },
      salaryExpectation: Number,
      relocation: Boolean,
    },

    // Resume
    resume: String,

    // Employer-specific fields
    companyName: {
      type: String,
      required: function () {
        return this.role === "employer";
      },
      trim: true,
    },
    companyDescription: {
      type: String,
    },
    companyLogo: {
      type: String,
    },
    businessPermit: {
      type: String,
      default: "",
    },

    // Admin
    isAdmin: {
      type: Boolean,
      default: false,
    },

    // Employer Approval (for employer role only)
    isApproved: {
      type: Boolean,
      default: function () {
        return this.role !== "employer"; // Graduates are auto-approved, employers need admin approval
      },
    },
    approvalStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: function () {
        return this.role === "employer" ? "pending" : "approved";
      },
    },
    rejectionReason: {
      type: String,
      default: "",
    },

    // Add experienceType for frontend tab selection
    experienceType: {
      type: String,
      enum: ["work", "internship"],
      default: "work",
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
module.exports = User;
