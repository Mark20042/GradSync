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

/** Core User document interface (mirrors Mongoose schema) */
export interface IUser extends Document {
  _id: Types.ObjectId;
  fullName: string;
  email: string;
  password: string;
  role: "graduate" | "employer";

  // Personal
  avatar?: string;
  bio?: string;
  phone?: string;
  address?: string;
  website?: string;

  // Graduate-specific
  degree?: string;
  university?: string;
  graduationYear?: number | null;
  major?: string;

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

  // Timestamps
  lastScanDate?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

// ─── Job Interface ──────────────────────────────────────────────────────

export interface IJob extends Document {
  _id: Types.ObjectId;
  title: string;
  description: string;
  requirements: string;
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
  createdAt?: Date;
  updatedAt?: Date;
}

// ─── Authenticated Request ─────────────────────────────────────────────

/** Express Request extended with authenticated user */
export interface AuthenticatedRequest extends Request {
  user: IUser;
}
