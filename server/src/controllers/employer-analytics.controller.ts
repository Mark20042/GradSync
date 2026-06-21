import type { Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { UnauthorizedError, BadRequestError } from "@/errors/index.js";
import { type AuthRequest } from "@/middlewares/auth.middleware.js";
import Job from "@/models/Job.model.js";
import Application from "@/models/Application.model.js";
import TerminationReview from "@/models/TerminationReview.model.js";
import User from "@/models/User.model.js";
import { getGeminiService } from "@/services/ai/gemini.service.js";

/** Helper: verify employer role and deduct GradCoins atomically */
const requireEmployerAndCoins = async (req: AuthRequest, coins: number) => {
  if (req.user.role !== "employer") throw new UnauthorizedError("Only employers can access analytics.");
  const employer = await User.findById(req.user._id).select("aiTokens").lean();
  if (!employer || (employer.aiTokens ?? 0) < coins)
    throw new BadRequestError(`Insufficient GradCoins. This report costs ${coins} coins.`);
  await User.findByIdAndUpdate(req.user._id, { $inc: { aiTokens: -coins } });
};

/** GET /api/analytics/employer/applications-over-time  — 5 coins
 *  Returns monthly application counts for the past 12 months
 */
export const getApplicationsOverTime = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    await requireEmployerAndCoins(req, 0);
    const companyId = req.user._id;
    const jobs = await Job.find({ company: companyId }).select("_id").lean();
    const jobIds = jobs.map(j => j._id);

    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth() - 11, 1);

    const rawData = await Application.aggregate([
      { $match: { job: { $in: jobIds }, createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
          applications: { $sum: 1 },
          hired: { $sum: { $cond: [{ $eq: ["$status", "Accepted"] }, 1, 0] } },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    const months: string[] = [];
    const result: { month: string; applications: number; hired: number }[] = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const label = d.toLocaleString("default", { month: "short", year: "numeric" });
      months.push(label);
      const match = rawData.find(r => r._id.year === d.getFullYear() && r._id.month === d.getMonth() + 1);
      result.push({ month: label, applications: match?.applications ?? 0, hired: match?.hired ?? 0 });
    }

    res.status(StatusCodes.OK).json({ data: result });
  } catch (e) { next(e); }
};

/** GET /api/analytics/employer/top-jobs  — 5 coins
 *  Returns top 10 jobs ranked by applicant count
 */
export const getTopJobs = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    await requireEmployerAndCoins(req, 0);
    const companyId = req.user._id;
    const jobs = await Job.find({ company: companyId }).select("_id").lean();
    const jobIds = jobs.map(j => j._id);

    const data = await Application.aggregate([
      { $match: { job: { $in: jobIds } } },
      {
        $group: {
          _id: "$job",
          applications: { $sum: 1 },
          hired: { $sum: { $cond: [{ $eq: ["$status", "Accepted"] }, 1, 0] } },
          terminated: { $sum: { $cond: [{ $eq: ["$status", "Terminated"] }, 1, 0] } },
        }
      },
      { $lookup: { from: "jobs", localField: "_id", foreignField: "_id", as: "job" } },
      { $unwind: "$job" },
      {
        $project: {
          title: "$job.title",
          type: "$job.type",
          applications: 1,
          hired: 1,
          terminated: 1,
          rating: "$job.averageRating",
          ratingCount: "$job.ratingCount",
        }
      },
      { $sort: { applications: -1 } },
      { $limit: 10 },
    ]);

    res.status(StatusCodes.OK).json({ data });
  } catch (e) { next(e); }
};

/** GET /api/analytics/employer/retention  — 10 coins
 *  Avg tenure (days) and retention rate across all terminated employees
 */
export const getRetentionStats = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    await requireEmployerAndCoins(req, 0);
    const companyId = req.user._id;
    const jobs = await Job.find({ company: companyId }).select("_id").lean();
    const jobIds = jobs.map(j => j._id);

    // Monthly terminated counts
    const monthlyTerminated = await Application.aggregate([
      { $match: { job: { $in: jobIds }, status: "Terminated", terminatedAt: { $exists: true } } },
      {
        $group: {
          _id: { year: { $year: "$terminatedAt" }, month: { $month: "$terminatedAt" } },
          count: { $sum: 1 },
          avgTenureDays: {
            $avg: {
              $max: [0, { $dateDiff: { startDate: "$createdAt", endDate: "$terminatedAt", unit: "day" } }]
            }
          },
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

    // Overall retention rate: hired - terminated / hired * 100
    const totalHired = await Application.countDocuments({ job: { $in: jobIds }, status: "Accepted" });
    const totalTerminated = await Application.countDocuments({ job: { $in: jobIds }, status: "Terminated" });
    const retentionRate = totalHired > 0 ? Math.round(((totalHired - totalTerminated) / totalHired) * 100) : null;

    const avgTenure = await Application.aggregate([
      { $match: { job: { $in: jobIds }, status: "Terminated", terminatedAt: { $exists: true } } },
      {
        $group: {
          _id: null,
          avg: { $avg: { $max: [0, { $dateDiff: { startDate: "$createdAt", endDate: "$terminatedAt", unit: "day" } }] } }
        }
      }
    ]);

    res.status(StatusCodes.OK).json({
      retentionRate,
      avgTenureDays: avgTenure[0] ? Math.round(avgTenure[0].avg) : null,
      totalHired,
      totalTerminated,
      chartData,
    });
  } catch (e) { next(e); }
};

/** GET /api/analytics/employer/termination-reasons  — 10 coins
 *  Breakdown of termination reasons across all terminated employees
 */
export const getTerminationReasons = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    await requireEmployerAndCoins(req, 0);
    const companyId = req.user._id;
    const jobs = await Job.find({ company: companyId }).select("_id").lean();
    const jobIds = jobs.map(j => j._id);

    const data = await Application.aggregate([
      { $match: { job: { $in: jobIds }, status: "Terminated", terminationReason: { $exists: true, $ne: null } } },
      { $group: { _id: "$terminationReason", count: { $sum: 1 } } },
      { $lookup: { from: "terminationreasons", localField: "_id", foreignField: "_id", as: "reason" } },
      { $unwind: { path: "$reason", preserveNullAndEmptyArrays: true } },
      { $project: { label: { $ifNull: ["$reason.label", "Unspecified"] }, count: 1 } },
      { $sort: { count: -1 } },
    ]);

    res.status(StatusCodes.OK).json({ data });
  } catch (e) { next(e); }
};

/** GET /api/analytics/employer/skill-gaps  — 15 coins
 *  Most common skills listed in rejected / short-tenure terminated applicants
 */
export const getSkillGaps = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const companyId = req.user._id;
    const isRefresh = req.query.refresh === 'true';

    // If not a refresh, try to return saved summary
    if (!isRefresh) {
      const employer = await User.findById(companyId).select("employerSkillGaps").lean();
      if (employer?.employerSkillGaps) {
        return res.status(StatusCodes.OK).json(employer.employerSkillGaps);
      }
      return res.status(StatusCodes.OK).json({ isCached: false });
    }

    await requireEmployerAndCoins(req, 15);
    const jobs = await Job.find({ company: companyId }).select("_id").lean();
    const jobIds = jobs.map(j => j._id);

    // Skills most cited in rejected applicants (skills they have = gaps employer doesn't value)
    const rejectedApps = await Application.find({ job: { $in: jobIds }, status: { $in: ["Rejected", "Terminated"] } })
      .populate("applicant", "skills").lean();

    const skillCount: Record<string, number> = {};
    rejectedApps.forEach((app: any) => {
      (app.applicant?.skills || []).forEach((sk: string) => {
        skillCount[sk] = (skillCount[sk] || 0) + 1;
      });
    });

    // Also check required skills on job postings
    const jobSkillsData = await Job.find({ company: companyId }).select("title skills").lean();
    const requiredSkills: Record<string, number> = {};
    jobSkillsData.forEach((j: any) => {
      (j.skills || []).forEach((sk: string) => {
        requiredSkills[sk] = (requiredSkills[sk] || 0) + 1;
      });
    });

    const topSkillGaps = Object.entries(skillCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 15)
      .map(([skill, count]) => ({ skill, rejectedCount: count }));

    const topRequiredSkills = Object.entries(requiredSkills)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 15)
      .map(([skill, count]) => ({ skill, requiredInJobs: count }));

    // Get termination reasons for AI context
    const terminationReasonsAgg = await Application.aggregate([
      { $match: { job: { $in: jobIds }, status: "Terminated", terminationReason: { $exists: true, $ne: null } } },
      { $group: { _id: "$terminationReason", count: { $sum: 1 } } },
      { $lookup: { from: "terminationreasons", localField: "_id", foreignField: "_id", as: "reason" } },
      { $unwind: { path: "$reason", preserveNullAndEmptyArrays: true } },
      { $project: { label: { $ifNull: ["$reason.label", "Unspecified"] }, count: 1 } },
      { $sort: { count: -1 } },
    ]);
    const terminationReasonsList = terminationReasonsAgg.map(r => r.label);

    const geminiService = getGeminiService();
    let aiRecommendations: string[] = [];
    try {
      const aiResult = await geminiService.analyzeSkillGaps(
        terminationReasonsList, 
        topSkillGaps.map(sk => ({ skill: sk.skill, count: sk.rejectedCount }))
      );
      aiRecommendations = aiResult.recommendations;
    } catch (error) {
      console.error("Gemini skill gaps analysis failed:", error);
    }

    const finalResult = { topSkillGaps, topRequiredSkills, aiRecommendations };
    
    // Save back to user
    await User.findByIdAndUpdate(companyId, { employerSkillGaps: finalResult });

    res.status(StatusCodes.OK).json(finalResult);
  } catch (e) { next(e); }
};

/** GET /api/analytics/employer/ai-summary  — 20 coins
 *  Aggregate insights summary (no external AI call, computed analytics narrative)
 */
export const getAISummary = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const companyId = req.user._id;
    const isRefresh = req.query.refresh === 'true';

    // If not a refresh, try to return saved summary
    if (!isRefresh) {
      const employer = await User.findById(companyId).select("employerAISummary").lean();
      if (employer?.employerAISummary) {
        return res.status(StatusCodes.OK).json(employer.employerAISummary);
      }
      return res.status(StatusCodes.OK).json({ isCached: false });
    }

    await requireEmployerAndCoins(req, 20);
    const jobs = await Job.find({ company: companyId }).select("_id title").lean();
    const jobIds = jobs.map(j => j._id);

    const [totalApps, totalHired, totalTerminated, totalRejected] = await Promise.all([
      Application.countDocuments({ job: { $in: jobIds } }),
      Application.countDocuments({ job: { $in: jobIds }, status: "Accepted" }),
      Application.countDocuments({ job: { $in: jobIds }, status: "Terminated" }),
      Application.countDocuments({ job: { $in: jobIds }, status: "Rejected" }),
    ]);

    const conversionRate = totalApps > 0 ? ((totalHired / totalApps) * 100).toFixed(1) : "0";
    const retentionRate = totalHired > 0 ? (((totalHired - totalTerminated) / totalHired) * 100).toFixed(1) : "N/A";

    const avgTenureAgg = await Application.aggregate([
      { $match: { job: { $in: jobIds }, status: "Terminated", terminatedAt: { $exists: true } } },
      { $group: { _id: null, avg: { $avg: { $max: [0, { $dateDiff: { startDate: "$createdAt", endDate: "$terminatedAt", unit: "day" } }] } } } }
    ]);
    const avgTenureDays = avgTenureAgg[0] ? Math.round(avgTenureAgg[0].avg) : null;

    const topJobAgg = await Application.aggregate([
      { $match: { job: { $in: jobIds } } },
      { $group: { _id: "$job", count: { $sum: 1 } } },
      { $lookup: { from: "jobs", localField: "_id", foreignField: "_id", as: "j" } },
      { $unwind: "$j" },
      { $sort: { count: -1 } },
      { $limit: 1 },
    ]);
    const topJob = topJobAgg[0] ? topJobAgg[0].j?.title : null;

    const companyRating = await User.findById(companyId).select("companyAverageRating companyRatingCount").lean() as any;

    const analyticsData = {
      totalApps,
      totalHired,
      conversionRate,
      totalTerminated,
      retentionRate,
      avgTenureDays,
      topJob,
      companyRating: companyRating?.companyAverageRating ?? null
    };

    const geminiService = getGeminiService();
    let insights: string[] = [];
    try {
      const aiResult = await geminiService.generateEmployerAISummary(analyticsData);
      insights = aiResult.insights;
    } catch (error) {
      console.error("Gemini summary generation failed:", error);
      insights = ["Failed to generate AI insights due to an error."];
    }

    const finalResult = {
      summary: analyticsData,
      insights,
    };

    // Save back to user
    await User.findByIdAndUpdate(companyId, { employerAISummary: finalResult });

    res.status(StatusCodes.OK).json(finalResult);
  } catch (e) { next(e); }
};
