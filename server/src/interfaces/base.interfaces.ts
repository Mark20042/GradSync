import type { Request, Response, NextFunction } from "express";
import type { Document, Types } from "mongoose";

// ─── User Interface (shared across modules) ────────────────────────────

export interface IExperience {
  title: string;
  company: string;
  location?: string;
  startDate?: Date;
  endDate?: Date;
  current?: boolean;
  description?: string;
}

export interface IEducation {
  school: string;
  degree?: string;
  startDate?: Date;
  endDate?: Date;
  location?: string;
  activities?: string;
}

export interface IAward {
  title: string;
  issuer?: string;
  date?: Date;
  description?: string;
}

export interface ICertification {
  name: string;
  issuer?: string;
  issueDate?: Date;
  expirationDate?: Date;
  credentialID?: string;
  credentialURL?: string;
}

export interface IProject {
  name: string;
  description?: string;
  url?: string;
  startDate?: Date;
  endDate?: Date;
  technologies?: string[];
}

export interface IVerifiedSkill {
  skill: string;
  assessmentTitle?: string;
  level?: "Entry" | "Mid" | "Senior" | "Expert";
  earnedAt?: Date;
  badgeIcon?: string;
  score?: number;
}

export interface IJobPreferences {
  desiredJobTitle?: string;
  industry?: string;
  preferredLocation?: string;
  jobType?: "Full-time" | "Part-time" | "Contract" | "Internship" | "Remote";
  salaryExpectation?: number;
  relocation?: boolean;
}

export interface ILanguage {
  language?: string;
  proficiency?: "Basic" | "Conversational" | "Fluent" | "Native";
}

// ─── Enhanced Work Experience (for Contract / Profile lifecycle) ─────────
export interface IWorkExperience {
  _id?: Types.ObjectId;
  companyName: string;
  startDate: Date;
  endDate?: Date | null;
  /** Auto-populated when endDate is first set on a previously-open record */
  exitStatus?: "Resigned" | "Terminated" | "Contract Ended" | null;
}

/** Core User document interface (mirrors Mongoose schema) */
export interface IUser extends Document {
  _id: Types.ObjectId;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  fullName: string;
  email: string;
  password: string;
  role: "graduate" | "employer" | "jobseeker";

  // Personal
  avatar?: string;
  bio?: string;
  phone?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  website?: string;

  // Graduate-specific
  degree?: string;
  university?: string;
  universityAddress?: string;
  graduationDate?: string;
  universityStartYear?: string;

  major?: string;
  birthdate?: Date | null;

  // Verification
  tor?: string;
  verificationStatus?: "pending" | "verified" | "failed";
  verificationMessage?: string;
  verified?: boolean;
  approvalStatus?: "pending" | "approved" | "rejected";
  rejectionReason?: string;

  // Professional links
  portfolio?: string;
  linkedin?: string;
  github?: string;

  // Collections
  experiences?: IExperience[];
  internships?: IExperience[];
  education?: IEducation[];
  skills?: string[];
  languages?: ILanguage[];
  awards?: IAward[];
  certifications?: ICertification[];
  projects?: IProject[];
  verifiedSkills?: IVerifiedSkill[];

  // Preferences
  jobPreferences?: IJobPreferences;
  resume?: string;

  // Employer-specific
  companyName?: string;
  companyDescription?: string;
  companyLogo?: string;
  businessPermit?: string;

  // Admin
  isAdmin?: boolean;
  isProfileComplete?: boolean;
  experienceType?: "work" | "internship";

  // Company rating aggregates (employer side — from jobseeker reviews)
  companyRatingCount?: number;
  companyRatingSum?: number;
  companyAverageRating?: number;
  employerAISummary?: any;
  employerSkillGaps?: any;

  // Employee conduct rating aggregates (score only shown publicly)
  employeeRatingCount?: number;
  employeeRatingSum?: number;
  employeeAverageRating?: number;

  // Timestamps
  lastScanDate?: Date;
  createdAt?: Date;
  updatedAt?: Date;
  aiTokens?: number;
  feedbackProvidedFeatures?: string[];

  // Web Push Subscription
  pushSubscription?: any;

  // Work Experience with exitStatus (Profile lifecycle)
  workExperienceEntries?: IWorkExperience[];
}

// ─── Job Interface ──────────────────────────────────────────────────────

export interface IJob extends Document {
  _id: Types.ObjectId;
  title: string;
  description: string;
  requirements: string;
  qualifications?: string;
  benefits?: string;
  company: Types.ObjectId | { companyName?: string };
  location?: string;
  type?: string;
  category?: string;
  skills?: string[];
  salary?: number;
  salaryMin?: number;
  salaryMax?: number;
  autoReplyMessage?: string;
  isClosed?: boolean;
  ratingCount?: number;
  ratingSum?: number;
  averageRating?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

// ─── Authenticated Request ─────────────────────────────────────────────

/** Express Request extended with authenticated user */
export interface AuthenticatedRequest extends Request {
  user: IUser;
}