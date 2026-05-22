import type { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
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
    
    const userIdObj = new mongoose.Types.ObjectId(userId);
    const userSkills = user.skills?.map(s => s.toLowerCase()) || [];
    const preferredLocation = user.address?.toLowerCase() || "";
    const desiredTitle = user.major?.toLowerCase() || "";

    const scoredJobs = await Job.aggregate([
      // 1. Only open jobs
      { $match: { isClosed: false } },
      
      // 2. Add searchable text combining skills and requirements for broad matching
      {
        $addFields: {
          searchableText: {
            $toLower: {
              $concat: [
                { $ifNull: ["$requirements", ""] },
                " ",
                {
                  $reduce: {
                    input: { $ifNull: ["$skills", []] },
                    initialValue: "",
                    in: { $concat: ["$$value", " ", "$$this"] }
                  }
                }
              ]
            }
          }
        }
      },
      
      // 3. Compute base match scores
      {
        $addFields: {
          skillMatchScore: {
            $size: {
              $filter: {
                input: userSkills,
                as: "us",
                cond: {
                  $gte: [{ $indexOfCP: ["$searchableText", "$$us"] }, 0]
                }
              }
            }
          },

          locationMatchScore: preferredLocation ? {
            $cond: [
              { $gte: [ { $indexOfCP: [ { $toLower: { $ifNull: ["$location", ""] } }, preferredLocation ] }, 0 ] },
              2,
              0
            ]
          } : 0,
          titleMatchScore: desiredTitle ? {
            $cond: [
              { $gte: [ { $indexOfCP: [ { $toLower: { $ifNull: ["$title", ""] } }, desiredTitle ] }, 0 ] },
              2,
              0
            ]
          } : 0
        }
      },
      
      // 4. Compute total score and primary reason
      {
        $addFields: {
          matchScore: {
            $add: [
              { $multiply: ["$skillMatchScore", 2] }, // Weight skills heavily
              "$locationMatchScore", 
              "$titleMatchScore"
            ]
          },
          matchReason: {
            $switch: {
              branches: [
                { case: { $gt: ["$locationMatchScore", 0] }, then: "Near you" },
                { case: { $gt: ["$skillMatchScore", 0] }, then: "Matches your skills" },
                { case: { $gt: ["$titleMatchScore", 0] }, then: "Matches your profile" }
              ],
              default: "Recommended"
            }
          }
        }
      },
      
      // 5. Filter out jobs with 0 score
      { $match: { matchScore: { $gt: 0 } } },
      
      // 6. Sort and Limit
      { $sort: { matchScore: -1 } },
      { $limit: 6 },
      
      // 7. Lookup Company Info
      {
        $lookup: {
          from: "users",
          localField: "company",
          foreignField: "_id",
          as: "companyInfo"
        }
      },
      {
        $unwind: { path: "$companyInfo", preserveNullAndEmptyArrays: true }
      },
      {
        $addFields: {
          company: {
            _id: "$companyInfo._id",
            fullName: "$companyInfo.fullName",
            companyName: "$companyInfo.companyName",
            companyLogo: "$companyInfo.companyLogo"
          }
        }
      },
      
      // 8. Lookup Saved Jobs
      {
        $lookup: {
          from: "savedjobs",
          let: { jobId: "$_id" },
          pipeline: [
            { $match: { $expr: { $and: [ { $eq: ["$job", "$$jobId"] }, { $eq: ["$graduate", userIdObj] } ] } } }
          ],
          as: "savedData"
        }
      },
      
      // 9. Lookup Applications
      {
        $lookup: {
          from: "applications",
          let: { jobId: "$_id" },
          pipeline: [
            { $match: { $expr: { $and: [ { $eq: ["$job", "$$jobId"] }, { $eq: ["$applicant", userIdObj] } ] } } }
          ],
          as: "appData"
        }
      },
      
      // 10. Extract flags and cleanup
      {
        $addFields: {
          id: "$_id",
          isSaved: { $gt: [{ $size: "$savedData" }, 0] },
          applicationStatus: { $ifNull: [{ $arrayElemAt: ["$appData.status", 0] }, null] }
        }
      },
      {
        $project: {
          searchableText: 0,
          skillMatchScore: 0,
          locationMatchScore: 0,
          titleMatchScore: 0,
          companyInfo: 0,
          savedData: 0,
          appData: 0
        }
      }
    ]);

    res.status(StatusCodes.OK).json(scoredJobs);
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
