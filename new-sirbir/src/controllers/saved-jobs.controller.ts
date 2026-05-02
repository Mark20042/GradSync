import type { Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { BadRequestError } from "@/errors/index.js";
import { type AuthRequest } from "@/middlewares/auth.middleware.js";
import SavedJob from "@/models/SavedJob.model.js";

const saveJob = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const exists = await SavedJob.findOne({ job: req.params.jobId, graduate: req.user._id });
    if (exists) throw new BadRequestError("Job already saved");
    const saved = await SavedJob.create({ job: req.params.jobId, graduate: req.user._id });
    res.status(StatusCodes.CREATED).json(saved);
  } catch (error) { next(error); }
};

const unsaveJob = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    await SavedJob.findOneAndDelete({ job: req.params.jobId, graduate: req.user._id });
    res.status(StatusCodes.OK).json({ message: "Job removed from saved list" });
  } catch (error) { next(error); }
};

const getMySavedJobs = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const savedJobs = await SavedJob.find({ graduate: req.user._id })
      .populate({ path: "job", populate: { path: "company", select: "fullName companyName companyLogo" } });
    res.status(StatusCodes.OK).json(savedJobs);
  } catch (error) { next(error); }
};

export { saveJob, unsaveJob, getMySavedJobs };
