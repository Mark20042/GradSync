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
import { uploadToCloudinary, deleteFromCloudinary, getPublicIdFromUrl } from "@/services/cloudinary.service.js";

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
      // Delete graduate's applications, saved jobs, assessments, and interview drafts
      await Application.deleteMany({ applicant: userId });
      await SavedJob.deleteMany({ graduate: userId });
      await Assessment.deleteMany({ user: userId });
      await Assessment.deleteMany({ candidateId: userId });
      await InterviewDraft.deleteMany({ candidateId: userId });
      await AssessmentSubmission.deleteMany({ user: userId });
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
    user.phone = body.phone || user.phone;
    user.address = body.address || user.address;
    user.website = body.website || user.website;
    user.verified = body.verified !== undefined ? body.verified : user.verified;
    if (user.role === "graduate" || user.role === "jobseeker") {
      user.university = body.university || user.university;
      user.degree = body.degree || user.degree;
      user.major = body.major || user.major;
      user.graduationYear = body.graduationYear || user.graduationYear;
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
      user.companyName = body.companyName || user.companyName;
      user.companyDescription = body.companyDescription || user.companyDescription;
    }
    const updatedUser = await user.save();
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
    if (role === "employer") ["degree","university","major","graduationYear","jobPreferences","skills","experiences","internships","education","awards","certifications","projects","languages"].forEach(f => delete userData[f]);
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
