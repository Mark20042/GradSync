import type { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { NotFoundError, UnauthorizedError } from "@/errors/index.js";
import { type AuthRequest } from "@/middlewares/auth.middleware.js";
import Job from "@/models/Job.model.js";
import User from "@/models/User.model.js";
import Application from "@/models/Application.model.js";
import SavedJob from "@/models/SavedJob.model.js";

const createJob = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (req.user.role !== "employer") throw new UnauthorizedError("Only employers can post jobs");
    const job = new Job({ ...req.body, company: req.user._id });
    await job.save();
    res.status(StatusCodes.CREATED).json(job);
  } catch (error) { next(error); }
};

const getAllJobs = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { keyword, location, type, minSalary, maxSalary, userId, category } = req.query as any;
    const query: any = { isClosed: false,
      ...(keyword && { title: { $regex: keyword, $options: "i" } }),
      ...(location && { location: { $regex: location, $options: "i" } }),
      ...(category && { category }),
      ...(type && { type }),
      ...(req.query.company && { company: req.query.company }),
    };
    const andConditions: any[] = [];
    if (minSalary && !isNaN(minSalary)) andConditions.push({ salaryMax: { $gte: Number(minSalary) } });
    if (maxSalary && !isNaN(maxSalary)) andConditions.push({ salaryMin: { $lte: Number(maxSalary) } });
    if (andConditions.length > 0) query.$and = andConditions;

    const jobs = await Job.find(query).populate("company", "fullName companyName companyLogo");
    let saveJobIds: string[] = [];
    const appliedJobStatusMap: Record<string, string> = {};
    if (userId) {
      const savedJobs = await SavedJob.find({ graduate: userId }).select("job");
      saveJobIds = savedJobs.map(s => String(s.job));
      const applications = await Application.find({ applicant: userId }).select("job status");
      applications.forEach(app => { appliedJobStatusMap[String(app.job)] = app.status; });
    }
    const jobsWithExtras = jobs.map(job => {
      const id = String(job._id);
      return { ...job.toObject(), isSaved: saveJobIds.includes(id), applicationStatus: appliedJobStatusMap[id] || null };
    });
    res.json(jobsWithExtras);
  } catch (error) { next(error); }
};

const getRecommendedJobs = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);
    if (!user) throw new NotFoundError("User not found");
    const userSkills = user.skills?.map(s => s.toLowerCase()) || [];
    const preferredLocation = user.jobPreferences?.preferredLocation?.toLowerCase() || user.address?.toLowerCase() || "";
    const jobs = await Job.find({ isClosed: false }).populate("company", "fullName companyName companyLogo");
    const savedJobs = await SavedJob.find({ graduate: userId }).select("job");
    const saveJobIds = savedJobs.map(s => String(s.job));
    const applications = await Application.find({ applicant: userId }).select("job status");
    const appliedMap: Record<string, string> = {};
    applications.forEach(app => { appliedMap[String(app.job)] = app.status; });

    let scoredJobs = jobs.map(job => {
      let score = 0; const reasons: string[] = [];
      const jobSkills = job.skills?.map(s => s.toLowerCase()) || [];
      const jobReq = job.requirements?.toLowerCase() || "";
      let skillMatch = 0;
      jobSkills.forEach(s => { if (userSkills.includes(s)) { score++; skillMatch++; } });
      userSkills.forEach(us => { if (!jobSkills.includes(us) && jobReq.includes(us)) { score++; skillMatch++; } });
      if (skillMatch > 0) reasons.push("Matches your skills");
      if (preferredLocation && job.location?.toLowerCase().includes(preferredLocation)) { score += 2; reasons.push("Near you"); }
      const desiredTitle = user.jobPreferences?.desiredJobTitle?.toLowerCase() || user.major?.toLowerCase() || "";
      if (desiredTitle && job.title?.toLowerCase().includes(desiredTitle)) { score += 2; reasons.push("Matches your profile"); }
      let primary = reasons.length > 0 ? reasons[reasons.length - 1]! : "Recommended";
      if (reasons.includes("Near you")) primary = "Near you";
      else if (reasons.includes("Matches your skills")) primary = "Matches your skills";
      const id = String(job._id);
      return { ...job.toObject(), matchScore: score, matchReason: primary, isSaved: saveJobIds.includes(id), applicationStatus: appliedMap[id] || null };
    });
    scoredJobs = scoredJobs.filter(j => j.matchScore > 0).sort((a, b) => b.matchScore - a.matchScore);
    res.status(StatusCodes.OK).json(scoredJobs.slice(0, 6));
  } catch (error) { next(error); }
};

const getEmployerJobs = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (req.user.role !== "employer") throw new UnauthorizedError("Only employers can access their jobs.");
    const jobs = await Job.find({ company: req.user._id }).populate("company", "fullName companyName companyLogo").lean();
    const jobsWithCounts = await Promise.all(jobs.map(async (job) => {
      const applicationCount = await Application.countDocuments({ job: job._id });
      return { ...job, applicationCount };
    }));
    res.status(StatusCodes.OK).json(jobsWithCounts);
  } catch (error) { next(error); }
};

const getJobById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.query as any;
    let applicationStatus = null; let isSaved = false;
    const job = await Job.findById(req.params.id).populate("company", "fullName companyName companyLogo");
    if (!job) throw new NotFoundError("Job not found");
    if (userId) {
      const app = await Application.findOne({ job: req.params.id, applicant: userId }).select("status");
      if (app) applicationStatus = app.status;
      const saved = await SavedJob.findOne({ job: req.params.id, graduate: userId });
      if (saved) isSaved = true;
    }
    res.status(StatusCodes.OK).json({ ...job.toObject(), applicationStatus, isSaved });
  } catch (error) { next(error); }
};

const updateJob = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) throw new NotFoundError("Job not found");
    if (String(job.company) !== String(req.user._id)) throw new UnauthorizedError("Not authorized");
    Object.assign(job, req.body);
    const updated = await job.save();
    res.status(StatusCodes.OK).json(updated);
  } catch (error) { next(error); }
};

const deleteJob = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) throw new NotFoundError("Job not found");
    if (String(job.company) !== String(req.user._id)) throw new UnauthorizedError("Not authorized");
    await job.deleteOne();
    res.status(StatusCodes.OK).json({ message: "Job deleted successfully" });
  } catch (error) { next(error); }
};

const toggleCloseJob = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) throw new NotFoundError("Job not found");
    if (String(job.company) !== String(req.user._id)) throw new UnauthorizedError("Not authorized");
    job.isClosed = !job.isClosed;
    await job.save();
    res.json({ message: "Job status toggled" });
  } catch (error) { next(error); }
};

export { createJob, getAllJobs, getRecommendedJobs, getEmployerJobs, getJobById, updateJob, deleteJob, toggleCloseJob };
