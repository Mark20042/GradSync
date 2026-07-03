import type { Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { UnauthorizedError } from "@/errors/index.js";
import { type AuthRequest } from "@/middlewares/auth.middleware.js";
import Job from "@/models/Job.model.js";
import Application from "@/models/Application.model.js";

const getTrend = (current: number, previous: number): number => {
  if (previous === 0) return current > 0 ? 1 : 0;
  return Math.round(((current - previous) / previous) * 100);
};

const getAnalyticsOverview = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (req.user.role !== "employer") throw new UnauthorizedError("Only employers can access analytics.");
    const companyId = req.user._id;
    const now = new Date();
    const jobs = await Job.find({ company: companyId }).select("_id").lean();
    const jobIds = jobs.map(j => j._id);
    const [totalActiveJobs, totalApplications, totalHired] = await Promise.all([
      Job.countDocuments({ company: companyId, isClosed: false }),
      Application.countDocuments({ job: { $in: jobIds } }),
      Application.countDocuments({ job: { $in: jobIds }, status: "Accepted" }),
    ]);
    const last7 = new Date(now); last7.setDate(last7.getDate() - 7);
    const prev7 = new Date(now); prev7.setDate(prev7.getDate() - 14);
    const [aLast, aPrev] = await Promise.all([
      Job.countDocuments({ company: companyId, createdAt: { $gte: last7 } }),
      Job.countDocuments({ company: companyId, createdAt: { $gte: prev7, $lt: last7 } }),
    ]);
    const [appLast, appPrev] = await Promise.all([
      Application.countDocuments({ job: { $in: jobIds }, createdAt: { $gte: last7, $lte: now } }),
      Application.countDocuments({ job: { $in: jobIds }, createdAt: { $gte: prev7, $lt: last7 } }),
    ]);
    const [hLast, hPrev] = await Promise.all([
      Application.countDocuments({ job: { $in: jobIds }, status: "Accepted", createdAt: { $gte: last7, $lte: now } }),
      Application.countDocuments({ job: { $in: jobIds }, status: "Accepted", createdAt: { $gte: prev7, $lt: last7 } }),
    ]);
    const trends = { activeJobs: getTrend(aLast, aPrev), applications: getTrend(appLast, appPrev), totalHired: getTrend(hLast, hPrev) };
    const [recentJobs, recentApplications] = await Promise.all([
      Job.find({ company: companyId }).sort({ createdAt: -1 }).limit(5).select("title location type createdAt isClosed"),
      Application.find({ job: { $in: jobIds } }).sort({ createdAt: -1 }).limit(5)
        .populate("applicant", "fullName email avatar").populate("job", "title"),
    ]);
    const applicationsPerJob = await Application.aggregate([
      { $match: { job: { $in: jobIds } } },
      { $group: { _id: "$job", count: { $sum: 1 } } },
      { $lookup: { from: "jobs", localField: "_id", foreignField: "_id", as: "job" } },
      { $unwind: "$job" },
      { $project: { job: "$job.title", applications: "$count" } },
    ]);
    const currentMonth = now.toLocaleString("default", { month: "long", year: "numeric" });
    res.status(StatusCodes.OK).json({ counts: { totalActiveJobs, totalApplications, totalHired }, trends, applicationsPerJob, currentMonth, data: { recentJobs, recentApplications } });
  } catch (error) { next(error); }
};

const getInDemandSkills = async (req: any, res: Response, next: NextFunction) => {
  try {
    const { category } = req.query;
    
    // Aggregation pipeline
    const pipeline: any[] = [
      { 
        $match: { 
          status: { $in: ["Hired", "Contract Ended", "Resigned", "Terminated"] } 
        } 
      },
      {
        $lookup: {
          from: "jobs",
          localField: "job",
          foreignField: "_id",
          as: "jobDetails"
        }
      },
      { $unwind: "$jobDetails" }
    ];

    if (category && category !== "all" && category !== "All Categories") {
      pipeline.push({
        $match: {
          "jobDetails.category": category
        }
      });
    }

    pipeline.push(
      {
        $lookup: {
          from: "users",
          localField: "applicant",
          foreignField: "_id",
          as: "applicantDetails"
        }
      },
      { $unwind: "$applicantDetails" },
      { $unwind: { path: "$applicantDetails.skills", preserveNullAndEmptyArrays: false } },
      {
        $group: {
          _id: "$applicantDetails.skills",
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 },
      {
        $project: {
          skill: "$_id",
          count: 1,
          _id: 0
        }
      }
    );

    const data = await Application.aggregate(pipeline);
    res.status(StatusCodes.OK).json({ data });
  } catch (error) { next(error); }
};

const getJobCategories = async (req: any, res: Response, next: NextFunction) => {
  try {
    const data = await Job.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $match: { _id: { $ne: null } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
      { $project: { category: "$_id", count: 1, _id: 0 } }
    ]);
    res.status(StatusCodes.OK).json({ data });
  } catch (error) { next(error); }
};

export { getAnalyticsOverview, getInDemandSkills, getJobCategories };
