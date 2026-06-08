import type { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import {
  NotFoundError,
  BadRequestError,
  UnauthorizedError,
} from "@/errors/index.js";
import { type AuthRequest } from "@/middlewares/auth.middleware.js";
import User from "@/models/User.model.js";
import Application from "@/models/Application.model.js";
import SavedJob from "@/models/SavedJob.model.js";
import Job from "@/models/Job.model.js";
import Conversation from "@/models/Conversation.model.js";
import Message from "@/models/Message.model.js";
import JobFAQ from "@/models/JobFAQ.model.js";
import EmployerSettings from "@/models/EmployerSettings.model.js";
import Assessment from "@/models/Assessment.model.js";
import InterviewDraft from "@/models/InterviewDraft.model.js";
import AssessmentSubmission from "@/models/AssessmentSubmission.model.js";
import FeatureFeedback from "@/models/FeatureFeedback.model.js";
import {
  deleteFromCloudinary,
  getPublicIdFromUrl,
} from "@/services/cloudinary.service.js";

const updateProfile = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) throw new NotFoundError("User not found");

    const body = req.body || {};

    // If avatar is changing, delete the old one from Cloudinary
    if (body.avatar && body.avatar !== user.avatar && user.avatar) {
      const pid = getPublicIdFromUrl(user.avatar);
      if (pid) await deleteFromCloudinary(pid, "image");
    }

    if (body.firstName !== undefined || body.middleName !== undefined || body.lastName !== undefined) {
      if (body.firstName !== undefined) user.firstName = body.firstName;
      if (body.middleName !== undefined) user.middleName = body.middleName;
      if (body.lastName !== undefined) user.lastName = body.lastName;
      user.fullName = [user.firstName, user.middleName, user.lastName].filter(Boolean).join(" ");
    } else if (body.fullName !== undefined) {
      user.fullName = body.fullName;
    }
    user.email = body.email || user.email;
    user.avatar = body.avatar || user.avatar;
    user.bio = body.bio !== undefined ? body.bio : user.bio;
    user.phone = body.phone !== undefined ? body.phone : user.phone;
    user.address = body.address !== undefined ? body.address : user.address;
    user.website = body.website !== undefined ? body.website : user.website;
    user.latitude = body.latitude !== undefined ? body.latitude : user.latitude;
    user.longitude = body.longitude !== undefined ? body.longitude : user.longitude;
    user.resume = body.resume !== undefined ? body.resume : user.resume;

    if (user.role === "graduate" || user.role === "jobseeker") {
      user.degree = body.degree || user.degree;
      user.university =
        body.university !== undefined ? body.university : user.university;
      user.universityAddress =
        body.universityAddress !== undefined
          ? body.universityAddress
          : user.universityAddress;
      user.graduationYear =
        body.graduationYear !== undefined
          ? body.graduationYear
          : user.graduationYear;
      user.major = body.major !== undefined ? body.major : user.major;
      user.birthdate =
        body.birthdate !== undefined ? body.birthdate : user.birthdate;
      user.portfolio =
        body.portfolio !== undefined ? body.portfolio : user.portfolio;
      user.linkedin =
        body.linkedin !== undefined ? body.linkedin : user.linkedin;
      user.github = body.github !== undefined ? body.github : user.github;
      if (body.experiences !== undefined) user.experiences = body.experiences;
      if (body.internships !== undefined) user.internships = body.internships;
      if (body.education !== undefined) user.education = body.education;
      if (body.skills !== undefined) user.skills = body.skills;
      if (body.languages !== undefined) user.languages = body.languages;
      if (body.awards !== undefined) user.awards = body.awards;
      if (body.certifications !== undefined)
        user.certifications = body.certifications;
      if (body.projects !== undefined) user.projects = body.projects;
      if (body.jobPreferences !== undefined)
        user.jobPreferences = body.jobPreferences;
      if (user.role === "graduate") {
        user.isProfileComplete = Boolean(
          user.university &&
          user.graduationYear &&
          user.degree &&
          user.skills &&
          user.skills.length > 0,
        );
      } else {
        user.isProfileComplete = Boolean(
          user.skills &&
          user.skills.length > 0 &&
          user.bio,
        );
      }
    }

    if (user.role === "employer") {
      // If companyLogo is changing, delete old one from Cloudinary
      if (
        body.companyLogo &&
        body.companyLogo !== user.companyLogo &&
        user.companyLogo
      ) {
        const pid = getPublicIdFromUrl(user.companyLogo);
        if (pid) await deleteFromCloudinary(pid, "image");
      }
      user.companyName = body.companyName || user.companyName;
      user.companyLogo =
        body.companyLogo !== undefined ? body.companyLogo : user.companyLogo;
      user.companyDescription =
        body.companyDescription !== undefined
          ? body.companyDescription
          : user.companyDescription;
    }

    await user.save();
    
    // Auto-generate assessments for any newly added skills
    if ((user.role === "graduate" || user.role === "jobseeker") && body.skills !== undefined) {
      try {
        const existingAssessments = await Assessment.find({ candidateId: user._id });
        const generatedSkills = existingAssessments.map((a: any) => a.skill.toLowerCase());
        
        const rawSkills = [...(user.verifiedSkills || []), ...(user.skills || [])];
        const allSkills = Array.from(new Set(
          rawSkills.map((s: any) => typeof s === 'object' ? (s.name || s.skill || JSON.stringify(s)) : s)
            .filter((s: any) => s && typeof s === 'string' && s.trim() !== '')
        )) as string[];

        const missingSkills = allSkills.filter(s => !generatedSkills.includes(s.toLowerCase()));

        if (missingSkills.length > 0) {
          import('@/services/generation.service.js').then(({ autoGenerateMissingForUser }) => {
            autoGenerateMissingForUser(user._id.toString(), missingSkills);
          }).catch(err => console.error("Failed to load generation service for auto-gen:", err));
        }
      } catch (err) {
        console.error("Error detecting missing skills on profile update:", err);
      }
    }

    const updatedUser = await User.findById(req.user._id).select("-password");
    res.status(StatusCodes.OK).json(updatedUser);
  } catch (error) {
    next(error);
  }
};

const deleteProfile = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) throw new NotFoundError("User not found");
    const userId = user._id;

    // Clean up Cloudinary files
    const cleanups: Promise<void>[] = [];
    if (user.avatar) {
      const pid = getPublicIdFromUrl(user.avatar);
      if (pid) cleanups.push(deleteFromCloudinary(pid, "image"));
    }
    if (user.resume) {
      const pid = getPublicIdFromUrl(user.resume);
      if (pid) cleanups.push(deleteFromCloudinary(pid, "image"));
    }
    if (user.companyLogo && user.companyLogo !== user.avatar) {
      const pid = getPublicIdFromUrl(user.companyLogo);
      if (pid) cleanups.push(deleteFromCloudinary(pid, "image"));
    }
    if ((user as any).tor) {
      const pid = getPublicIdFromUrl((user as any).tor);
      if (pid) cleanups.push(deleteFromCloudinary(pid, "image"));
    }
    if ((user as any).businessPermit) {
      const pid = getPublicIdFromUrl((user as any).businessPermit);
      if (pid) cleanups.push(deleteFromCloudinary(pid, "image"));
    }
    await Promise.allSettled(cleanups);

    if (user.role === "graduate" || user.role === "jobseeker") {
      await Application.deleteMany({ applicant: userId });
      await SavedJob.deleteMany({ graduate: userId });
      await Assessment.deleteMany({ user: userId });
      await Assessment.deleteMany({ candidateId: userId });
      await InterviewDraft.deleteMany({ candidateId: userId });
      await AssessmentSubmission.deleteMany({ user: userId });
    }
    if (user.role === "employer") {
      const jobs = await Job.find({ company: userId }).select("_id");
      const jobIds = jobs.map((j) => j._id);
      await Application.deleteMany({ job: { $in: jobIds } });
      await SavedJob.deleteMany({ job: { $in: jobIds } });
      await Job.deleteMany({ _id: { $in: jobIds } });
      // Delete employer's FAQs and settings
      await JobFAQ.deleteMany({ employer: userId });
      await EmployerSettings.deleteMany({ user: userId });
    }
    const conversations = await Conversation.find({
      participants: { $in: [userId] },
    });
    const conversationIds = conversations.map((c) => c._id);
    await Message.deleteMany({ conversationId: { $in: conversationIds } });
    await Conversation.deleteMany({ _id: { $in: conversationIds } });
    await FeatureFeedback.deleteMany({ user: userId });
    await User.findByIdAndDelete(userId);
    res
      .status(StatusCodes.OK)
      .json({
        message: "Account and all associated data deleted successfully",
      });
  } catch (error) {
    next(error);
  }
};

const deleteResume = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) throw new NotFoundError("User not found");
    if (user.role !== "graduate" && user.role !== "jobseeker")
      throw new UnauthorizedError("Only graduates and job seekers can delete resumes");

    // Delete from Cloudinary
    if (user.resume) {
      const pid = getPublicIdFromUrl(user.resume);
      if (pid) await deleteFromCloudinary(pid, "image");
    }

    user.resume = "";
    await user.save();
    res.status(StatusCodes.OK).json({ message: "Resume deleted successfully" });
  } catch (error) {
    next(error);
  }
};

const getEmployers = async (
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const employers = await User.find({ role: "employer" })
      .select(
        "companyName companyLogo companyDescription email website address",
      )
      .sort({ createdAt: -1 });
    res.status(StatusCodes.OK).json(employers);
  } catch (error) {
    next(error);
  }
};

const getUserById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await User.findById(req.params.id).select(
      "-password -isAdmin",
    );
    if (!user) throw new NotFoundError("User not found");
    res.status(StatusCodes.OK).json(user);
  } catch (error) {
    next(error);
  }
};

export {
  updateProfile,
  deleteProfile,
  deleteResume,
  getEmployers,
  getUserById,
};
