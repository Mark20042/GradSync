import type { Response, NextFunction } from "express";
import mongoose from "mongoose";
import { StatusCodes } from "http-status-codes";
import { NotFoundError, BadRequestError } from "@/errors/index.js";
import { type AuthRequest } from "@/middlewares/auth.middleware.js";
import User from "@/models/User.model.js";
import Job from "@/models/Job.model.js";
import Application from "@/models/Application.model.js";
import FAQ from "@/models/FAQ.model.js";
import JobFAQ from "@/models/JobFAQ.model.js";
import EmployerSettings from "@/models/EmployerSettings.model.js";
import SavedJob from "@/models/SavedJob.model.js";
import Conversation from "@/models/Conversation.model.js";
import Message from "@/models/Message.model.js";
import Assessment from "@/models/Assessment.model.js";
import InterviewDraft from "@/models/InterviewDraft.model.js";
import FeatureFeedback from "@/models/FeatureFeedback.model.js";
import AssessmentSubmission from "@/models/AssessmentSubmission.model.js";
import TerminationReview from "@/models/TerminationReview.model.js";
import SystemSettings from "@/models/SystemSettings.model.js";
import SystemMetrics from "@/models/SystemMetrics.model.js";
import { uploadToCloudinary, deleteFromCloudinary, getPublicIdFromUrl } from "@/services/cloudinary.service.js";
import { createNotification } from "@/utils/notification.helper.js";
import { recalcCompanyRating, recalcEmployeeRating } from "@/controllers/termination-review.controller.js";
import { getIo } from "@/services/socket.service.js";

export const getAnalytics = async (req: any, res: Response, next: NextFunction) => {
  try {
    const totalUsers = await User.countDocuments({ isAdmin: { $ne: true } });
    const totalGraduates = await User.countDocuments({ role: "graduate", isAdmin: { $ne: true } });
    const totalEmployers = await User.countDocuments({ role: "employer", isAdmin: { $ne: true } });
    const totalJobSeekers = await User.countDocuments({ role: "jobseeker", isAdmin: { $ne: true } });
    const totalJobs = await Job.countDocuments();
    const activeJobs = await Job.countDocuments({ isClosed: false });
    const totalApplications = await Application.countDocuments();
    const hiredApplications = await Application.countDocuments({ status: "Accepted" });
    const rejectedApplications = await Application.countDocuments({ status: "Rejected" });
    const pendingApplications = await Application.countDocuments({ status: "In Review" });
    const appliedApplications = await Application.countDocuments({ status: "Applied" });
    const recentUsers = await User.aggregate([
      { $match: { isAdmin: { $ne: true } } },
      { $sort: { createdAt: -1 } },
      { $limit: 5 },
      { $project: { fullName: 1, email: 1, role: 1, createdAt: 1 } }
    ]);
    const jobCategories = await Job.aggregate([{ $group: { _id: "$category", count: { $sum: 1 } } }]);
    const applicationsPerCategory = await Application.aggregate([
      { $lookup: { from: "jobs", localField: "job", foreignField: "_id", as: "jobData" } },
      { $unwind: "$jobData" },
      { $group: { _id: "$jobData.category", count: { $sum: 1 } } }
    ]);
    const topCompaniesByApplications = await Application.aggregate([
      { $lookup: { from: "jobs", localField: "job", foreignField: "_id", as: "jobData" } },
      { $unwind: "$jobData" },
      { $lookup: { from: "users", localField: "jobData.company", foreignField: "_id", as: "companyData" } },
      { $unwind: "$companyData" },
      { $group: { _id: "$companyData.companyName", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);
    const topJobsByApplications = await Application.aggregate([
      { $lookup: { from: "jobs", localField: "job", foreignField: "_id", as: "jobData" } },
      { $unwind: "$jobData" },
      { $group: { _id: "$jobData.title", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    res.json({ counts: { totalUsers, totalGraduates, totalEmployers, totalJobSeekers, totalJobs, activeJobs, totalApplications, hiredApplications, rejectedApplications, pendingApplications, appliedApplications }, recentUsers, jobCategories, applicationsPerCategory, topCompaniesByApplications, topJobsByApplications });
  } catch (error) { next(error); }
};

export const getAllApplications = async (_req: any, res: Response, next: NextFunction) => {
  try {
    const applications = await Application.aggregate([
      { $sort: { createdAt: -1 } },
      { $lookup: { from: "jobs", localField: "job", foreignField: "_id", as: "jobDetails" } },
      { $unwind: { path: "$jobDetails", preserveNullAndEmptyArrays: true } },
      { $lookup: { from: "users", localField: "jobDetails.company", foreignField: "_id", as: "companyDetails" } },
      { $unwind: { path: "$companyDetails", preserveNullAndEmptyArrays: true } },
      { $lookup: { from: "users", localField: "applicant", foreignField: "_id", as: "applicantDetails" } },
      { $unwind: { path: "$applicantDetails", preserveNullAndEmptyArrays: true } },
      {
        $addFields: {
          job: {
            _id: "$jobDetails._id",
            title: "$jobDetails.title",
            company: {
              _id: "$companyDetails._id",
              companyName: "$companyDetails.companyName",
              companyLogo: "$companyDetails.companyLogo"
            },
            category: "$jobDetails.category",
            type: "$jobDetails.type",
            location: "$jobDetails.location",
            requirements: "$jobDetails.requirements",
            skills: "$jobDetails.skills"
          },
          applicant: {
            _id: "$applicantDetails._id",
            fullName: "$applicantDetails.fullName",
            email: "$applicantDetails.email",
            avatar: "$applicantDetails.avatar",
            role: "$applicantDetails.role",
            skills: "$applicantDetails.skills",
            major: "$applicantDetails.major"
          }
        }
      },
      {
        $project: { jobDetails: 0, companyDetails: 0, applicantDetails: 0 }
      }
    ]);
    res.json(applications);
  } catch (error) { next(error); }
};

export const deleteApplication = async (req: any, res: Response, next: NextFunction) => {
  try {
    const application = await Application.findById(req.params.id);
    if (!application) throw new NotFoundError("Application not found");
    
    // Also remove the resume from cloudinary if it exists
    if (application.resume) {
      const pid = getPublicIdFromUrl(application.resume);
      if (pid) await deleteFromCloudinary(pid, "image");
    }

    await application.deleteOne();
    res.json({ message: "Application removed successfully" });
  } catch (error) { next(error); }
};

export const getAllUsers = async (_req: any, res: Response, next: NextFunction) => {
  try { 
    const users = await User.aggregate([
      { $match: { isAdmin: { $ne: true } } },
      { $sort: { createdAt: -1 } },
      {
        $lookup: {
          from: "assessments",
          localField: "_id",
          foreignField: "candidateId",
          as: "assessments"
        }
      },
      {
        $addFields: {
          assessmentCount: { $size: "$assessments" },
          generatedSkills: {
            $map: {
              input: "$assessments",
              as: "a",
              in: { skill: "$$a.skill", status: "$$a.status" }
            }
          },
          isGenerating: {
            $in: ["generating", "$assessments.status"]
          }
        }
      },
      { $project: { password: 0, assessments: 0 } } // Exclude password and heavy assessments array
    ]);
    // Append system settings to the response if needed, or create a separate endpoint
    res.json(users);
  }
  catch (error) { next(error); }
};

export const getCandidates = async (_req: any, res: Response, next: NextFunction) => {
  try { 
    const users = await User.aggregate([
      { $match: { isAdmin: { $ne: true }, role: { $in: ["jobseeker", "graduate"] } } },
      { $sort: { createdAt: -1 } },
      {
        $lookup: {
          from: "assessments",
          localField: "_id",
          foreignField: "candidateId",
          as: "assessments"
        }
      },
      {
        $addFields: {
          assessmentCount: { $size: "$assessments" },
          generatedSkills: {
            $map: {
              input: "$assessments",
              as: "a",
              in: { skill: "$$a.skill", status: "$$a.status" }
            }
          },
          isGenerating: {
            $in: ["generating", "$assessments.status"]
          }
        }
      },
      { $project: { password: 0, assessments: 0 } }
    ]);
    res.json(users);
  }
  catch (error) { next(error); }
};

export const deleteUser = async (req: any, res: Response, next: NextFunction) => {
  try {
    const user = await User.findById(req.params.id);
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
      const affectedReviews = await TerminationReview.find({ employee: userId, isJobseekerRated: true }).select("company");
      const affectedCompanies = [...new Set(affectedReviews.map(r => r.company.toString()))];

      // Delete graduate's applications, saved jobs, assessments, and interview drafts
      await Application.deleteMany({ applicant: userId });
      await SavedJob.deleteMany({ graduate: userId });
      await Assessment.deleteMany({ user: userId });
      await Assessment.deleteMany({ candidateId: userId });
      await InterviewDraft.deleteMany({ candidateId: userId });
      await AssessmentSubmission.deleteMany({ user: userId });
      await TerminationReview.deleteMany({ employee: userId });

      for (const compId of affectedCompanies) {
        await recalcCompanyRating(compId);
      }
    }

    if (user.role === "employer") {
      // Delete all jobs owned by employer + their cascading data
      const jobs = await Job.find({ company: userId }).select("_id");
      const jobIds = jobs.map(j => j._id);
      await Application.deleteMany({ job: { $in: jobIds } });
      await SavedJob.deleteMany({ job: { $in: jobIds } });
      await Job.deleteMany({ _id: { $in: jobIds } });
      // Delete employer's FAQs, settings
      await JobFAQ.deleteMany({ employer: userId });
      await EmployerSettings.deleteMany({ user: userId });
    }

    // Delete conversations and messages involving this user
    const conversations = await Conversation.find({ participants: { $in: [userId] } });
    const conversationIds = conversations.map(c => c._id);
    await Message.deleteMany({ conversationId: { $in: conversationIds } });
    await Conversation.deleteMany({ _id: { $in: conversationIds } });

    await FeatureFeedback.deleteMany({ user: userId });

    await user.deleteOne();
    res.json({ message: "User and all associated data removed" });
  } catch (error) { next(error); }
};

export const updateUser = async (req: any, res: Response, next: NextFunction) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) throw new NotFoundError("User not found");
    const body = req.body;

    if (body.firstName !== undefined || body.middleName !== undefined || body.lastName !== undefined) {
      if (body.firstName !== undefined) user.firstName = body.firstName;
      if (body.middleName !== undefined) user.middleName = body.middleName;
      if (body.lastName !== undefined) user.lastName = body.lastName;
      user.fullName = [user.firstName, user.middleName, user.lastName].filter(Boolean).join(" ");
    } else if (body.fullName !== undefined) {
      user.fullName = body.fullName;
    }

    user.email = body.email || user.email;
    user.role = body.role || user.role;
    if (body.phone !== undefined) user.phone = body.phone;
    if (body.address !== undefined) user.address = body.address;
    if (body.website !== undefined) user.website = body.website;
    user.verified = body.verified !== undefined ? body.verified : user.verified;
    if (body.avatar !== undefined) user.avatar = body.avatar;
    if (body.companyLogo !== undefined) user.companyLogo = body.companyLogo;
    
    let tokensAdded = false;
    let tokensReduced = false;
    let addedAmount = 0;
    let reducedAmount = 0;
    
    if (body.aiTokens !== undefined) {
      const currentTokens = user.aiTokens || 0;
      if (body.aiTokens > currentTokens) {
        tokensAdded = true;
        addedAmount = body.aiTokens - currentTokens;
      } else if (body.aiTokens < currentTokens) {
        tokensReduced = true;
        reducedAmount = currentTokens - body.aiTokens;
      }
      user.aiTokens = body.aiTokens;
    }

    if (user.role === "graduate" || user.role === "jobseeker") {
      user.university = body.university || user.university;
      user.degree = body.degree || user.degree;
      user.major = body.major || user.major;
      user.graduationYear = body.graduationYear || user.graduationYear;
      user.universityStartYear = body.universityStartYear || user.universityStartYear;
      user.linkedin = body.linkedin || user.linkedin;
      user.github = body.github || user.github;
      user.portfolio = body.portfolio || user.portfolio;
      if (body.jobPreferences) user.jobPreferences = { ...user.jobPreferences, ...body.jobPreferences };
      if (body.skills) user.skills = body.skills;
      if (body.experiences) user.experiences = body.experiences;
      if (body.internships) user.internships = body.internships;
      if (body.languages) user.languages = body.languages;
      if (body.awards) user.awards = body.awards;
      if (body.certifications) user.certifications = body.certifications;
      if (body.projects) user.projects = body.projects;
    }
    if (user.role === "employer") {
      if (body.companyName !== undefined) user.companyName = body.companyName;
      if (body.companyDescription !== undefined) user.companyDescription = body.companyDescription;
    }
    const updatedUser = await user.save();

    if (tokensAdded) {
      await createNotification(
        updatedUser._id,
        "TOKENS_ADDED",
        "Tokens Received",
        `You have received ${addedAmount} GradCoins from the Administrator!`
      );
      try {
        const io = getIo();
        io.to(updatedUser._id.toString()).emit("receiveNotification", {
          title: "Tokens Received",
          message: `You have received ${addedAmount} GradCoins from the Administrator!`,
          type: "TOKENS_ADDED"
        });
      } catch (err) {
        console.error("Socket emit failed", err);
      }
    }

    if (tokensReduced) {
      await createNotification(
        updatedUser._id,
        "TOKENS_DEDUCTED",
        "Tokens Adjusted",
        `${reducedAmount} GradCoins have been deducted from your account by the Administrator.`
      );
      try {
        const io = getIo();
        io.to(updatedUser._id.toString()).emit("receiveNotification", {
          title: "Tokens Adjusted",
          message: `${reducedAmount} GradCoins have been deducted from your account by the Administrator.`,
          type: "TOKENS_DEDUCTED"
        });
      } catch (err) {
        console.error("Socket emit failed", err);
      }
    }

    res.json(updatedUser);
  } catch (error) { next(error); }
};

export const getUserSavedJobs = async (req: any, res: Response, next: NextFunction) => {
  try {
    const savedJobs = await SavedJob.aggregate([
      { $match: { graduate: new mongoose.Types.ObjectId(req.params.id) } },
      { $lookup: { from: "jobs", localField: "job", foreignField: "_id", as: "jobDetails" } },
      { $unwind: { path: "$jobDetails", preserveNullAndEmptyArrays: true } },
      { $lookup: { from: "users", localField: "jobDetails.company", foreignField: "_id", as: "companyDetails" } },
      { $unwind: { path: "$companyDetails", preserveNullAndEmptyArrays: true } },
      {
        $addFields: {
          job: {
            _id: "$jobDetails._id",
            title: "$jobDetails.title",
            company: { _id: "$companyDetails._id", companyName: "$companyDetails.companyName" }
          }
        }
      },
      { $project: { jobDetails: 0, companyDetails: 0 } }
    ]);
    res.json(savedJobs);
  } catch (error) { next(error); }
};

export const getAllJobs = async (_req: any, res: Response, next: NextFunction) => {
  try {
    const jobs = await Job.aggregate([
      { $sort: { createdAt: -1 } },
      {
        $lookup: {
          from: "users",
          localField: "company",
          foreignField: "_id",
          as: "companyDetails"
        }
      },
      {
        $unwind: { path: "$companyDetails", preserveNullAndEmptyArrays: true }
      },
      {
        $addFields: {
          company: {
            _id: "$companyDetails._id",
            companyName: "$companyDetails.companyName",
            email: "$companyDetails.email"
          }
        }
      },
      {
        $project: {
          companyDetails: 0
        }
      }
    ]);
    res.json(jobs);
  }
  catch (error) { next(error); }
};

export const deleteJob = async (req: any, res: Response, next: NextFunction) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) throw new NotFoundError("Job not found");
    const jobId = job._id;
    // Delete all related data
    await Application.deleteMany({ job: jobId });
    await SavedJob.deleteMany({ job: jobId });
    await JobFAQ.deleteMany({ job: jobId });
    await job.deleteOne();
    res.json({ message: "Job and all associated data removed" });
  } catch (error) { next(error); }
};

export const updateJob = async (req: any, res: Response, next: NextFunction) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) throw new NotFoundError("Job not found");
    const body = req.body;
    job.title = body.title || job.title; job.description = body.description || job.description;
    job.requirements = body.requirements || job.requirements; 
    job.qualifications = body.qualifications || job.qualifications;
    job.benefits = body.benefits !== undefined ? body.benefits : job.benefits;
    job.skills = body.skills || job.skills;
    job.category = body.category || job.category;
    job.type = body.type || job.type;
    job.salaryMin = body.salaryMin !== undefined ? body.salaryMin : job.salaryMin;
    job.salaryMax = body.salaryMax !== undefined ? body.salaryMax : job.salaryMax;
    job.location = body.location || job.location;
    job.isClosed = body.isClosed !== undefined ? body.isClosed : job.isClosed;
    job.autoReplyMessage = body.autoReplyMessage !== undefined ? body.autoReplyMessage : job.autoReplyMessage;
    res.json(await job.save());
  } catch (error) { next(error); }
};

export const getReports = async (_req: any, res: Response, next: NextFunction) => {
  try {
    const [users, jobs, applications, faqs, jobFaqs, employerSettings] = await Promise.all([
      User.aggregate([{ $project: { password: 0 } }]),
      Job.aggregate([
        { $lookup: { from: "users", localField: "company", foreignField: "_id", as: "c" } },
        { $unwind: { path: "$c", preserveNullAndEmptyArrays: true } },
        { $addFields: { company: { _id: "$c._id", companyName: "$c.companyName" } } },
        { $project: { c: 0 } }
      ]),
      Application.aggregate([
        { $lookup: { from: "users", localField: "applicant", foreignField: "_id", as: "a" } },
        { $unwind: { path: "$a", preserveNullAndEmptyArrays: true } },
        { $lookup: { from: "jobs", localField: "job", foreignField: "_id", as: "j" } },
        { $unwind: { path: "$j", preserveNullAndEmptyArrays: true } },
        { $lookup: { from: "users", localField: "j.company", foreignField: "_id", as: "jc" } },
        { $unwind: { path: "$jc", preserveNullAndEmptyArrays: true } },
        { $addFields: { 
            applicant: { _id: "$a._id", fullName: "$a.fullName", email: "$a.email" },
            job: { _id: "$j._id", title: "$j.title", company: { _id: "$jc._id", companyName: "$jc.companyName" } }
        }},
        { $project: { a: 0, j: 0, jc: 0 } }
      ]),
      FAQ.aggregate([{ $sort: { order: 1 } }]),
      JobFAQ.aggregate([
        { $lookup: { from: "users", localField: "employer", foreignField: "_id", as: "e" } },
        { $unwind: { path: "$e", preserveNullAndEmptyArrays: true } },
        { $lookup: { from: "jobs", localField: "job", foreignField: "_id", as: "j" } },
        { $unwind: { path: "$j", preserveNullAndEmptyArrays: true } },
        { $addFields: { 
            employer: { _id: "$e._id", fullName: "$e.fullName", companyName: "$e.companyName" },
            job: { _id: "$j._id", title: "$j.title" }
        }},
        { $project: { e: 0, j: 0 } }
      ]),
      EmployerSettings.aggregate([
        { $lookup: { from: "users", localField: "user", foreignField: "_id", as: "u" } },
        { $unwind: { path: "$u", preserveNullAndEmptyArrays: true } },
        { $addFields: { user: { _id: "$u._id", fullName: "$u.fullName", companyName: "$u.companyName", email: "$u.email" } } },
        { $project: { u: 0 } }
      ])
    ]);
    res.json({ users, jobs, applications, faqs, jobFaqs, employerSettings });
  } catch (error) { next(error); }
};

export const getFAQs = async (_req: any, res: Response, next: NextFunction) => {
  try { res.json(await FAQ.aggregate([{ $sort: { order: 1 } }])); } catch (error) { next(error); }
};
export const createFAQ = async (req: any, res: Response, next: NextFunction) => {
  try { const faq = new FAQ(req.body); res.status(201).json(await faq.save()); } catch (error) { next(error); }
};
export const updateFAQ = async (req: any, res: Response, next: NextFunction) => {
  try {
    const faq = await FAQ.findById(req.params.id);
    if (!faq) throw new NotFoundError("FAQ not found");
    faq.question = req.body.question || faq.question; faq.answer = req.body.answer || faq.answer;
    faq.category = req.body.category || faq.category;
    faq.order = req.body.order !== undefined ? req.body.order : faq.order;
    faq.isActive = req.body.isActive !== undefined ? req.body.isActive : faq.isActive;
    res.json(await faq.save());
  } catch (error) { next(error); }
};
export const deleteFAQ = async (req: any, res: Response, next: NextFunction) => {
  try {
    const faq = await FAQ.findById(req.params.id);
    if (!faq) throw new NotFoundError("FAQ not found");
    await faq.deleteOne(); res.json({ message: "FAQ removed" });
  } catch (error) { next(error); }
};
export const getJobFAQs = async (_req: any, res: Response, next: NextFunction) => {
  try { 
    res.json(await JobFAQ.aggregate([
      { $sort: { createdAt: -1 } },
      { $lookup: { from: "users", localField: "employer", foreignField: "_id", as: "e" } },
      { $unwind: { path: "$e", preserveNullAndEmptyArrays: true } },
      { $lookup: { from: "jobs", localField: "job", foreignField: "_id", as: "j" } },
      { $unwind: { path: "$j", preserveNullAndEmptyArrays: true } },
      { $addFields: { 
          employer: { _id: "$e._id", fullName: "$e.fullName", email: "$e.email", companyName: "$e.companyName" },
          job: { _id: "$j._id", title: "$j.title" }
      }},
      { $project: { e: 0, j: 0 } }
    ])); 
  }
  catch (error) { next(error); }
};
export const createJobFAQ = async (req: any, res: Response, next: NextFunction) => {
  try {
    const jobFAQ = new JobFAQ(req.body); await jobFAQ.save();
    await (jobFAQ as any).populate("employer", "fullName email companyName");
    if (jobFAQ.job) await (jobFAQ as any).populate("job", "title");
    res.status(201).json(jobFAQ);
  } catch (error) { next(error); }
};
export const updateJobFAQ = async (req: any, res: Response, next: NextFunction) => {
  try {
    const jobFAQ = await JobFAQ.findById(req.params.id);
    if (!jobFAQ) throw new NotFoundError("Job FAQ not found");
    jobFAQ.question = req.body.question || jobFAQ.question; jobFAQ.answer = req.body.answer || jobFAQ.answer;
    jobFAQ.keywords = req.body.keywords || jobFAQ.keywords; jobFAQ.employer = req.body.employer || jobFAQ.employer;
    if (req.body.job !== undefined) jobFAQ.job = req.body.job;
    await jobFAQ.save();
    await (jobFAQ as any).populate("employer", "fullName email companyName");
    if (jobFAQ.job) await (jobFAQ as any).populate("job", "title");
    res.json(jobFAQ);
  } catch (error) { next(error); }
};
export const deleteJobFAQ = async (req: any, res: Response, next: NextFunction) => {
  try {
    const jobFAQ = await JobFAQ.findById(req.params.id);
    if (!jobFAQ) throw new NotFoundError("Job FAQ not found");
    await jobFAQ.deleteOne(); res.json({ message: "Job FAQ removed" });
  } catch (error) { next(error); }
};
export const getAllEmployerSettings = async (_req: any, res: Response, next: NextFunction) => {
  try { 
    res.json(await EmployerSettings.aggregate([
      { $lookup: { from: "users", localField: "user", foreignField: "_id", as: "u" } },
      { $unwind: { path: "$u", preserveNullAndEmptyArrays: true } },
      { $addFields: { user: { _id: "$u._id", fullName: "$u.fullName", email: "$u.email", companyName: "$u.companyName" } } },
      { $project: { u: 0 } }
    ])); 
  }
  catch (error) { next(error); }
};
export const createEmployerSettings = async (req: any, res: Response, next: NextFunction) => {
  try {
    const { user, timezone, businessHours, autoReplyMessage } = req.body;
    const existing = await EmployerSettings.findOne({ user });
    if (existing) throw new BadRequestError("Settings for this employer already exist");
    const settings = new EmployerSettings({ user, timezone, businessHours, autoReplyMessage });
    await settings.save(); await (settings as any).populate("user", "fullName email companyName");
    res.status(201).json(settings);
  } catch (error) { next(error); }
};
export const updateEmployerSettings = async (req: any, res: Response, next: NextFunction) => {
  try {
    const settings = await EmployerSettings.findById(req.params.id);
    if (!settings) throw new NotFoundError("Settings not found");
    settings.timezone = req.body.timezone || settings.timezone;
    settings.businessHours = req.body.businessHours || settings.businessHours;
    settings.autoReplyMessage = req.body.autoReplyMessage || settings.autoReplyMessage;
    await settings.save(); res.json(settings);
  } catch (error) { next(error); }
};
export const createUser = async (req: any, res: Response, next: NextFunction) => {
  try {
    const { email, role } = req.body;
    if (await User.findOne({ email })) throw new BadRequestError("User already exists");
    const userData = { ...req.body };
    if (userData.firstName || userData.lastName) {
      userData.fullName = [userData.firstName, userData.middleName, userData.lastName].filter(Boolean).join(" ");
    }
    // Auto-verify when created by admin so tor/permit are not required
    userData.verified = true;
    userData.verificationStatus = "verified";
    userData.approvalStatus = "approved";

    if ((role === "graduate" || role === "jobseeker") && !userData.degree) userData.degree = "Not Specified";
    if (role === "employer" && !userData.companyName) userData.companyName = "Not Specified";
    if (role === "employer") ["degree","university","major","graduationYear","universityStartYear","jobPreferences","skills","experiences","internships","education","awards","certifications","projects","languages"].forEach(f => delete userData[f]);

    // Apply initial AI Tokens based on system settings
    if (userData.aiTokens === undefined) {
      try {
        const settings = await SystemSettings.findOne();
        if (settings && settings.initialTokens) {
          if (role === "jobseeker") userData.aiTokens = settings.initialTokens.jobseeker;
          else if (role === "employer") userData.aiTokens = settings.initialTokens.employer;
          else if (role === "graduate") userData.aiTokens = settings.initialTokens.graduate;
        } else {
          // Defaults if not set
          if (role === "jobseeker") userData.aiTokens = 5;
          else if (role === "employer") userData.aiTokens = 5;
          else if (role === "graduate") userData.aiTokens = 5;
        }
      } catch (err) {
        console.error("Failed to assign initial tokens to new user", err);
      }
    }

    const user = await User.create(userData);
    const resp = user.toObject(); delete (resp as { password?: string }).password;
    res.status(201).json(resp);
  } catch (error) { next(error); }
};
export const createJob = async (req: any, res: Response, next: NextFunction) => {
  try { const job = new Job(req.body); await job.save(); res.status(201).json(job); }
  catch (error) { next(error); }
};
export const uploadImage = async (req: any, res: Response, next: NextFunction) => {
  try {
    if (!req.file) throw new BadRequestError("No file uploaded");
    const result = await uploadToCloudinary(req.file.buffer, "gradsync/admin", "image", req.file.originalname);
    res.status(200).json({ imageUrl: result.url });
  } catch (error) { next(error); }
};

export const getAIFeedbacks = async (_req: any, res: Response, next: NextFunction) => {
  try {
    const feedbacks = await FeatureFeedback.aggregate([
      { $sort: { createdAt: -1 } },
      { $lookup: { from: "users", localField: "user", foreignField: "_id", as: "u" } },
      { $unwind: { path: "$u", preserveNullAndEmptyArrays: true } },
      { $addFields: { user: { _id: "$u._id", fullName: "$u.fullName", email: "$u.email", role: "$u.role" } } },
      { $project: { u: 0 } }
    ]);
    res.json(feedbacks);
  } catch (error) { next(error); }
};

export const deleteAIFeedback = async (req: any, res: Response, next: NextFunction) => {
  try {
    const feedback = await FeatureFeedback.findById(req.params.id);
    if (!feedback) throw new NotFoundError("Feedback not found");
    await feedback.deleteOne();
    res.json({ message: "Feedback removed successfully" });
  } catch (error) { next(error); }
};

export const getSystemSettings = async (_req: any, res: Response, next: NextFunction) => {
  try {
    let settings = await SystemSettings.findOne();
    if (!settings) {
      settings = await SystemSettings.create({});
    }
    res.json(settings);
  } catch (error) { next(error); }
};

export const updateSystemSettings = async (req: any, res: Response, next: NextFunction) => {
  try {
    let settings = await SystemSettings.findOne();
    if (!settings) {
      settings = new SystemSettings(req.body);
    } else {
      if (req.body.aiCosts) {
        if (!settings.aiCosts) settings.aiCosts = { interview: 20, jobMatch: 1, suitability: 1, skillVerification: 1, profileGeneration: 1 };
        if (req.body.aiCosts.interview !== undefined) settings.aiCosts.interview = req.body.aiCosts.interview;
        if (req.body.aiCosts.jobMatch !== undefined) settings.aiCosts.jobMatch = req.body.aiCosts.jobMatch;
        if (req.body.aiCosts.suitability !== undefined) settings.aiCosts.suitability = req.body.aiCosts.suitability;
        if (req.body.aiCosts.skillVerification !== undefined) settings.aiCosts.skillVerification = req.body.aiCosts.skillVerification;
        if (req.body.aiCosts.profileGeneration !== undefined) settings.aiCosts.profileGeneration = req.body.aiCosts.profileGeneration;
      }
      if (req.body.initialTokens) {
        if (!settings.initialTokens) settings.initialTokens = { graduate: 5, jobseeker: 5, employer: 5 };
        if (req.body.initialTokens.graduate !== undefined) settings.initialTokens.graduate = req.body.initialTokens.graduate;
        if (req.body.initialTokens.jobseeker !== undefined) settings.initialTokens.jobseeker = req.body.initialTokens.jobseeker;
        if (req.body.initialTokens.employer !== undefined) settings.initialTokens.employer = req.body.initialTokens.employer;
      }
      if (req.body.tokenPackages) {
        if (!settings.tokenPackages) settings.tokenPackages = {
          basic: { tokens: 5, price: 109 },
          popular: { tokens: 15, price: 239 },
          premium: { tokens: 30, price: 549 }
        };
        ['basic', 'popular', 'premium'].forEach(pkg => {
          if (req.body.tokenPackages[pkg]) {
            if (req.body.tokenPackages[pkg].tokens !== undefined) settings.tokenPackages[pkg].tokens = req.body.tokenPackages[pkg].tokens;
            if (req.body.tokenPackages[pkg].price !== undefined) settings.tokenPackages[pkg].price = req.body.tokenPackages[pkg].price;
          }
        });
      }
    }
    if (req.body.aiCosts) {
      settings.markModified('aiCosts');
    }
    if (req.body.initialTokens) {
      settings.markModified('initialTokens');
    }
    if (req.body.tokenPackages) {
      settings.markModified('tokenPackages');
    }
    await settings.save();
    res.json(settings);
  } catch (error) { next(error); }
};

export const getSystemMetrics = async (_req: any, res: Response, next: NextFunction) => {
  try {
    const today = new Date().toISOString().split("T")[0];
    let metrics = await SystemMetrics.findOne({ date: today });
    if (!metrics) {
      metrics = await SystemMetrics.create({ date: today });
    }
    res.json(metrics);
  } catch (error) { next(error); }
};

export const getAllTerminations = async (_req: any, res: Response, next: NextFunction) => {
  try {
    const reviews = await TerminationReview.find()
      .populate("company", "companyName companyLogo email")
      .populate("employee", "fullName avatar email")
      .populate("job", "title")
      .populate("terminationReason", "label")
      .sort({ terminationDate: -1 })
      .lean();
    res.json(reviews);
  } catch (error) { next(error); }
};

export const clearEmployerReview = async (req: any, res: Response, next: NextFunction) => {
  try {
    const review = await TerminationReview.findById(req.params.id);
    if (!review) throw new NotFoundError("Review not found");
    
    review.employerRating = undefined;
    review.employerFeedback = undefined;
    review.employerTags = undefined;
    await review.save();
    
    // We should also recalculate the employee's rating, but since jobseeker ratings from employers are not aggregated onto the user model right now (only companyRating is aggregated), we can just clear the review here.
    
    res.json({ message: "Employer review cleared successfully", review });
  } catch (error) { next(error); }
};

export const clearJobseekerReview = async (req: any, res: Response, next: NextFunction) => {
  try {
    const review = await TerminationReview.findById(req.params.id);
    if (!review) throw new NotFoundError("Review not found");
    
    review.jobseekerRating = undefined;
    review.jobseekerFeedback = undefined;
    review.jobseekerTags = undefined;
    await review.save();
    
    // Recalculate company rating
    if (review.company) {
      const allCompanyReviews = await TerminationReview.find({ 
        company: review.company, 
        jobseekerRating: { $exists: true, $ne: null } 
      });
      const totalRatings = allCompanyReviews.length;
      const sumRatings = allCompanyReviews.reduce((sum, r) => sum + (r.jobseekerRating || 0), 0);
      const avgRating = totalRatings > 0 ? sumRatings / totalRatings : 0;
      await User.findByIdAndUpdate(review.company, { 
        companyAverageRating: parseFloat(avgRating.toFixed(1)),
        companyRatingCount: totalRatings
      });
    }

    res.json({ message: "Jobseeker review cleared successfully", review });
  } catch (error) { next(error); }
};

export const getPlatformApplicationsOverTime = async (req: any, res: Response, next: NextFunction) => {
  try {
    const { companyId } = req.query;
    let matchQuery: any = {};
    if (companyId) {
      const jobs = await Job.find({ company: companyId }).select("_id").lean();
      matchQuery.job = { $in: jobs.map((j) => j._id) };
    }

    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth() - 11, 1);

    const rawData = await Application.aggregate([
      { $match: { ...matchQuery, createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" }
          },
          applications: { $sum: 1 },
          hired: { $sum: { $cond: [{ $in: ["$status", ["Accepted", "Hired"]] }, 1, 0] } }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    const result: { month: string; applications: number; hired: number }[] = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const label = d.toLocaleString("default", { month: "short", year: "numeric" });
      const match = rawData.find(r => r._id.year === d.getFullYear() && r._id.month === d.getMonth() + 1);
      result.push({ month: label, applications: match?.applications ?? 0, hired: match?.hired ?? 0 });
    }

    res.status(200).json({ data: result });
  } catch (e) { next(e); }
};

export const getPlatformTopJobs = async (req: any, res: Response, next: NextFunction) => {
  try {
    const { companyId } = req.query;
    let matchQuery: any = {};
    if (companyId) {
      matchQuery.company = companyId;
    }

    const data = await Job.aggregate([
      { $match: matchQuery },
      {
        $lookup: {
          from: "applications",
          localField: "_id",
          foreignField: "job",
          as: "apps"
        }
      },
      {
        $project: {
          title: 1,
          applicants: { $size: "$apps" }
        }
      },
      { $sort: { applicants: -1 } },
      { $limit: 5 }
    ]);
    res.status(200).json({ data });
  } catch (e) { next(e); }
};

export const getPlatformRetentionStats = async (req: any, res: Response, next: NextFunction) => {
  try {
    const { companyId } = req.query;
    let appMatchQuery: any = { status: { $in: ["Terminated", "Resigned", "Contract Ended"] }, terminatedAt: { $exists: true } };

    if (companyId) {
      const jobs = await Job.find({ company: companyId }).select("_id").lean();
      const jobIds = jobs.map((j) => j._id);
      appMatchQuery.job = { $in: jobIds };
    }

    const totalCurrentlyHired = await Application.countDocuments({ ...(companyId ? appMatchQuery.job ? { job: appMatchQuery.job } : {} : {}), status: "Accepted" });
    const totalTerminated = await Application.countDocuments(appMatchQuery);
    const totalEverHired = totalCurrentlyHired + totalTerminated;

    // Monthly terminated counts
    const monthlyTerminated = await Application.aggregate([
      { $match: appMatchQuery },
      { $lookup: { from: "contracts", localField: "_id", foreignField: "application", as: "contractData" } },
      { $unwind: { path: "$contractData", preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: { year: { $year: "$terminatedAt" }, month: { $month: "$terminatedAt" } },
          count: { $sum: 1 },
          avgTenureDays: { $avg: { $max: [0, { $dateDiff: { startDate: { $ifNull: ["$contractData.startDate", "$createdAt"] }, endDate: "$terminatedAt", unit: "day" } }] } }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    const now = new Date();
    const chartData = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const label = d.toLocaleString("default", { month: "short", year: "numeric" });
      const match = monthlyTerminated.find(r => r._id.year === d.getFullYear() && r._id.month === d.getMonth() + 1);
      chartData.push({
        month: label,
        terminated: match?.count ?? 0,
        avgTenureDays: match ? Math.round(match.avgTenureDays) : 0,
      });
    }

    const retentionRateVal = totalEverHired > 0 ? Math.round(((totalEverHired - totalTerminated) / totalEverHired) * 100) : null;

    const avgTenure = await Application.aggregate([
      { $match: appMatchQuery },
      { $lookup: { from: "contracts", localField: "_id", foreignField: "application", as: "contractData" } },
      { $unwind: { path: "$contractData", preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: null,
          avg: { $avg: { $max: [0, { $dateDiff: { startDate: { $ifNull: ["$contractData.startDate", "$createdAt"] }, endDate: "$terminatedAt", unit: "day" } }] } }
        }
      }
    ]);

    res.status(200).json({
      retentionRate: retentionRateVal,
      avgTenureDays: avgTenure[0] ? Math.round(avgTenure[0].avg) : null,
      totalHired: totalCurrentlyHired,
      totalTerminated,
      chartData,
    });
  } catch (e) { next(e); }
};

export const getPlatformTerminationReasons = async (req: any, res: Response, next: NextFunction) => {
  try {
    const { companyId } = req.query;
    let matchQuery: any = { status: { $in: ["Terminated", "Resigned", "Contract Ended"] }, terminationReason: { $exists: true, $ne: null } };

    if (companyId) {
      const jobs = await Job.find({ company: companyId }).select("_id").lean();
      matchQuery.job = { $in: jobs.map((j) => j._id) };
    }

    const data = await Application.aggregate([
      { $match: matchQuery },
      { $group: { _id: "$terminationReason", count: { $sum: 1 } } },
      { $lookup: { from: "terminationreasons", localField: "_id", foreignField: "_id", as: "reason" } },
      { $unwind: { path: "$reason", preserveNullAndEmptyArrays: true } },
      { $project: { label: { $cond: [{ $eq: ["$reason.label", "Resigned (Profile Updated)"] }, "Resigned", { $ifNull: ["$reason.label", "Unspecified"] }] }, count: 1 } },
      { $sort: { count: -1 } },
    ]);
    res.status(200).json({ data });
  } catch (e) { next(e); }
};

export const getPlatformSkillGaps = async (req: any, res: Response, next: NextFunction) => {
  try {
    const { companyId, jobId } = req.query;
    let matchQuery: any = { status: { $in: ["Rejected", "Terminated", "Resigned", "Contract Ended"] } };
    let jobFilter: any = {};

    if (jobId) {
      jobFilter._id = jobId;
      matchQuery.job = jobId;
    } else if (companyId) {
      jobFilter.company = companyId;
      const jobs = await Job.find(jobFilter).select("_id").lean();
      matchQuery.job = { $in: jobs.map((j) => j._id) };
    }

    const rejectedApps = await Application.find(matchQuery)
      .populate("applicant", "skills").lean();

    const skillCount: Record<string, number> = {};
    rejectedApps.forEach((app: any) => {
      (app.applicant?.skills || []).forEach((sk: string) => {
        skillCount[sk] = (skillCount[sk] || 0) + 1;
      });
    });

    const topSkillGaps = Object.entries(skillCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 15)
      .map(([skill, count]) => ({ skill, rejectedCount: count }));

    const jobSkillsData = await Job.find(jobFilter).select("title skills").lean();
    const requiredSkills: Record<string, number> = {};
    jobSkillsData.forEach((j: any) => {
      (j.skills || []).forEach((sk: string) => {
        requiredSkills[sk] = (requiredSkills[sk] || 0) + 1;
      });
    });

    const topRequiredSkills = Object.entries(requiredSkills)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 15)
      .map(([skill, count]) => ({ skill, requiredInJobs: count }));

    res.status(200).json({ 
      data: {
        topSkillGaps,
        topRequiredSkills,
        aiRecommendations: ["Select a specific employer to generate actionable AI recommendations based on their exact skill mismatches and termination history."]
      }
    });
  } catch (e) { next(e); }
};

export const getPlatformAISummary = async (req: any, res: Response, next: NextFunction) => {
  try {
    const { companyId } = req.query;
    let appsQuery: any = {};

    if (companyId) {
      const jobs = await Job.find({ company: companyId }).select("_id").lean();
      appsQuery.job = { $in: jobs.map(j => j._id) };
    }

    const [totalApps, totalCurrentlyHired, totalTerminated, totalRejected] = await Promise.all([
      Application.countDocuments(appsQuery),
      Application.countDocuments({ ...appsQuery, status: "Accepted" }),
      Application.countDocuments({ ...appsQuery, status: { $in: ["Terminated", "Resigned", "Contract Ended"] } }),
      Application.countDocuments({ ...appsQuery, status: "Rejected" }),
    ]);

    const totalEverHired = totalCurrentlyHired + totalTerminated;
    const conversionRate = totalApps > 0 ? ((totalEverHired / totalApps) * 100).toFixed(1) : "0";
    const retentionRate = totalEverHired > 0 ? (((totalEverHired - totalTerminated) / totalEverHired) * 100).toFixed(1) : "N/A";

    const avgTenureAgg = await Application.aggregate([
      { $match: { ...appsQuery, status: { $in: ["Terminated", "Resigned", "Contract Ended"] }, terminatedAt: { $exists: true } } },
      { $lookup: { from: "contracts", localField: "_id", foreignField: "application", as: "contractData" } },
      { $unwind: { path: "$contractData", preserveNullAndEmptyArrays: true } },
      { $group: { _id: null, avg: { $avg: { $max: [0, { $dateDiff: { startDate: { $ifNull: ["$contractData.startDate", "$createdAt"] }, endDate: "$terminatedAt", unit: "day" } }] } } } }
    ]);
    const avgTenureDays = avgTenureAgg[0] ? Math.round(avgTenureAgg[0].avg) : null;

    let topJobMatchQuery = companyId ? { company: companyId } : {};

    const topJobAgg = await Application.aggregate([
      { $match: appsQuery }, // match applications
      { $group: { _id: "$job", count: { $sum: 1 } } },
      { $lookup: { from: "jobs", localField: "_id", foreignField: "_id", as: "j" } },
      { $unwind: "$j" },
      { $sort: { count: -1 } },
      { $limit: 1 },
    ]);
    const topJob = topJobAgg[0] ? topJobAgg[0].j?.title : null;

    let companyRating = 0;
    if (companyId) {
       const comp = await User.findById(companyId).select("companyAverageRating").lean() as any;
       companyRating = comp?.companyAverageRating || 0;
    }

    const analyticsData = {
      totalApps,
      totalHired: totalCurrentlyHired,
      totalEverHired,
      conversionRate,
      totalTerminated,
      retentionRate,
      avgTenureDays,
      topJob,
      companyRating
    };

    const geminiService = (await import('@/services/ai/gemini.service.js')).getGeminiService();
    let insights: string[] = [];
    try {
      const aiSummary = await geminiService.generateEmployerAISummary(analyticsData as any);
      insights = aiSummary.insights;
    } catch (e) {
      console.error("Platform AI summary error:", e);
      insights = ["Failed to generate insights."];
    }

    res.status(200).json({ summary: analyticsData, insights });
  } catch (e) { next(e); }
};
