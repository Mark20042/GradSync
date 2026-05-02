import type { Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { BadRequestError, NotFoundError, UnauthorizedError } from "@/errors/index.js";
import { type AuthRequest } from "@/middlewares/auth.middleware.js";
import Application from "@/models/Application.model.js";
import Job from "@/models/Job.model.js";
import { createNotification } from "@/utils/notification.helper.js";

const applyToJob = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (req.user.role !== "graduate") throw new UnauthorizedError("Only graduates can apply");
    const existing = await Application.findOne({ job: req.params.jobId, applicant: req.user._id });
    if (existing) throw new BadRequestError("Already applied");
    const application = await Application.create({ job: req.params.jobId, applicant: req.user._id, resume: req.user.resume });
    try {
      const job = await Job.findById(req.params.jobId).populate("company", "fullName");
      if (job && job.company) {
        const company = job.company as any;
        await createNotification(company._id, "APPLICATION", "New Application Received",
          `${req.user.fullName || "A candidate"} applied to your job: ${job.title}`, application._id);
      }
    } catch (e) { console.error("Notification error:", e); }
    res.status(StatusCodes.CREATED).json(application);
  } catch (error) { next(error); }
};

const getMyApplications = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const apps = await Application.find({ applicant: req.user._id })
      .populate({ path: "job", select: "title location type company", populate: { path: "company", select: "companyName fullName" } })
      .sort({ createdAt: -1 });
    res.status(StatusCodes.OK).json(apps);
  } catch (error) { next(error); }
};

const getApplicationsByJob = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const job = await Job.findById(req.params.jobId);
    if (!job || String(job.company) !== String(req.user._id)) throw new NotFoundError("Not authorized");
    const apps = await Application.find({ job: req.params.jobId })
      .populate("job", "title location category type skills requirements")
      .populate("applicant", "fullName email resume avatar skills major");
    res.status(StatusCodes.OK).json(apps);
  } catch (error) { next(error); }
};

const getApplicationById = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const app = await Application.findById(req.params.id)
      .populate("job", "title company")
      .populate("applicant", "fullName degree email avatar bio resume skills verifiedSkills experiences internships education projects portfolio linkedin phone address awards certifications languages");
    if (!app) throw new NotFoundError("Application not found");
    res.status(StatusCodes.OK).json(app);
  } catch (error) { next(error); }
};

const updateApplicationStatus = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { status } = req.body;
    const app = await Application.findById(req.params.id).populate("job");
    if (!app) throw new NotFoundError("Not authorized");
    app.status = status;
    await app.save();
    res.json({ message: "Application status updated", status });
  } catch (error) { next(error); }
};

export { applyToJob, getMyApplications, getApplicationsByJob, getApplicationById, updateApplicationStatus };
