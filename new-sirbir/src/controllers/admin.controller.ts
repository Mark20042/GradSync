import type { Response, NextFunction } from "express";
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
import { uploadToCloudinary, deleteFromCloudinary, getPublicIdFromUrl } from "@/services/cloudinary.service.js";

export const getAnalytics = async (req: any, res: Response, next: NextFunction) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalGraduates = await User.countDocuments({ role: "graduate" });
    const totalEmployers = await User.countDocuments({ role: "employer" });
    const totalJobs = await Job.countDocuments();
    const activeJobs = await Job.countDocuments({ isClosed: false });
    const totalApplications = await Application.countDocuments();
    const hiredApplications = await Application.countDocuments({ status: "Accepted" });
    const rejectedApplications = await Application.countDocuments({ status: "Rejected" });
    const pendingApplications = await Application.countDocuments({ status: "In Review" });
    const appliedApplications = await Application.countDocuments({ status: "Applied" });
    const recentUsers = await User.find().sort({ createdAt: -1 }).limit(5).select("fullName email role createdAt");
    const jobCategories = await Job.aggregate([{ $group: { _id: "$category", count: { $sum: 1 } } }]);
    res.json({ counts: { totalUsers, totalGraduates, totalEmployers, totalJobs, activeJobs, totalApplications, hiredApplications, rejectedApplications, pendingApplications, appliedApplications }, recentUsers, jobCategories });
  } catch (error) { next(error); }
};

export const getAllApplications = async (_req: any, res: Response, next: NextFunction) => {
  try {
    const applications = await Application.find()
      .populate({
        path: "job",
        select: "title company category type location requirements skills",
        populate: { path: "company", select: "companyName companyLogo" }
      })
      .populate("applicant", "fullName email avatar role skills major")
      .sort({ createdAt: -1 });

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
  try { res.json(await User.find().select("-password").sort({ createdAt: -1 })); }
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

    if (user.role === "graduate") {
      // Delete graduate's applications, saved jobs, assessments
      await Application.deleteMany({ applicant: userId });
      await SavedJob.deleteMany({ graduate: userId });
      await Assessment.deleteMany({ user: userId });
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

    await user.deleteOne();
    res.json({ message: "User and all associated data removed" });
  } catch (error) { next(error); }
};

export const updateUser = async (req: any, res: Response, next: NextFunction) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) throw new NotFoundError("User not found");
    const body = req.body;
    user.fullName = body.fullName || user.fullName;
    user.email = body.email || user.email;
    user.role = body.role || user.role;
    user.phone = body.phone || user.phone;
    user.address = body.address || user.address;
    user.website = body.website || user.website;
    user.verified = body.verified !== undefined ? body.verified : user.verified;
    if (user.role === "graduate") {
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
    const savedJobs = await SavedJob.find({ graduate: req.params.id }).populate({ path: "job", populate: { path: "company", select: "companyName" } });
    res.json(savedJobs);
  } catch (error) { next(error); }
};

export const getAllJobs = async (_req: any, res: Response, next: NextFunction) => {
  try { res.json(await Job.find().populate("company", "companyName email").sort({ createdAt: -1 })); }
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
    job.requirements = body.requirements || job.requirements; job.category = body.category || job.category;
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
      User.find().select("-password"), Job.find().populate("company", "companyName"),
      Application.find().populate("applicant", "fullName email").populate({ path: "job", select: "title company", populate: { path: "company", select: "companyName" } }),
      FAQ.find().sort({ order: 1 }), JobFAQ.find().populate("employer", "fullName companyName").populate("job", "title"),
      EmployerSettings.find().populate("user", "fullName companyName email"),
    ]);
    res.json({ users, jobs, applications, faqs, jobFaqs, employerSettings });
  } catch (error) { next(error); }
};

export const getFAQs = async (_req: any, res: Response, next: NextFunction) => {
  try { res.json(await FAQ.find().sort({ order: 1 })); } catch (error) { next(error); }
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
  try { res.json(await JobFAQ.find().populate("employer", "fullName email companyName").populate("job", "title").sort({ createdAt: -1 })); }
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
  try { res.json(await EmployerSettings.find().populate("user", "fullName email companyName")); }
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
    if (role === "graduate" && !userData.degree) userData.degree = "Not Specified";
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
