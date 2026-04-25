import mongoose, { Schema } from 'mongoose';
import type { IUser } from '../interfaces/base.interfaces.js';

// ─── Sub-Schemas ────────────────────────────────────────────────────────

const experienceSchema = new Schema({
  title: { type: String, required: true },
  company: { type: String, required: true },
  location: String,
  startDate: Date,
  endDate: Date,
  current: { type: Boolean, default: false },
  description: String,
});

const educationSchema = new Schema({
  school: { type: String, required: true },
  degree: String,
  startDate: Date,
  endDate: Date,
  location: String,
  activities: String,
});

const awardSchema = new Schema({
  title: { type: String, required: true },
  issuer: String,
  date: Date,
  description: String,
});

const certificationSchema = new Schema({
  name: { type: String, required: true },
  issuer: String,
  issueDate: Date,
  expirationDate: Date,
  credentialID: String,
  credentialURL: String,
});

const projectSchema = new Schema({
  name: { type: String, required: true },
  description: String,
  url: String,
  startDate: Date,
  endDate: Date,
  technologies: [String],
});

// ─── Main User Schema ──────────────────────────────────────────────────

const userSchema = new Schema<IUser>(
  {
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6,
    },
    role: {
      type: String,
      required: [true, 'Role is required'],
      enum: ['graduate', 'employer'],
    },

    // Personal Information
    avatar: String,
    bio: String,
    phone: String,
    address: String,
    website: String,

    // Graduate-specific fields
    degree: { type: String },
    university: { type: String, default: '' },
    graduationYear: { type: Number, default: null },
    major: String,

    // Professional profiles
    tor: { type: String, default: '' },
    verificationStatus: {
      type: String,
      enum: ['pending', 'verified', 'failed'],
      default: 'pending',
    },
    verificationMessage: { type: String, default: '' },
    approvalStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    rejectionReason: { type: String, default: '' },
    portfolio: { type: String, default: '' },
    linkedin: { type: String, default: '' },
    github: { type: String, default: '' },

    // Work experience
    experiences: [experienceSchema],
    internships: [experienceSchema],

    // Education
    education: [educationSchema],

    // Skills & expertise
    skills: { type: [String], default: [] },
    languages: [
      {
        language: String,
        proficiency: {
          type: String,
          enum: ['Basic', 'Conversational', 'Fluent', 'Native'],
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
        enum: ['Full-time', 'Part-time', 'Contract', 'Internship', 'Remote'],
      },
      salaryExpectation: Number,
      relocation: Boolean,
    },

    // Resume
    resume: String,

    // Employer-specific fields
    companyName: { type: String, trim: true },
    companyDescription: String,
    companyLogo: String,
    businessPermit: { type: String, default: '' },

    // Admin
    isAdmin: { type: Boolean, default: false },

    // Verification
    verified: { type: Boolean, default: false },

    // Experience type
    experienceType: {
      type: String,
      enum: ['work', 'internship'],
      default: 'work',
    },

    // Profile completion tracking
    isProfileComplete: { type: Boolean, default: false },

    // Verified Skills (from Assessments)
    verifiedSkills: [
      {
        skill: { type: String, required: true },
        assessmentTitle: { type: String, default: '' },
        level: {
          type: String,
          enum: ['Entry', 'Mid', 'Senior', 'Expert'],
          default: 'Entry',
        },
        earnedAt: { type: Date, default: Date.now },
        badgeIcon: { type: String, default: '' },
        score: { type: Number, default: 0 },
      },
    ],

    // AI scan tracking
    lastScanDate: Date,
  },
  { timestamps: true }
);

const User = mongoose.model<IUser>('User', userSchema);
export default User;
