import type { Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { BadRequestError, NotFoundError, UnauthorizedError } from "@/errors/index.js";
import { type AuthRequest } from "@/middlewares/auth.middleware.js";
import Application from "@/models/Application.model.js";
import Job from "@/models/Job.model.js";
import { createNotification } from "@/utils/notification.helper.js";

const applyToJob = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (req.user.role !== "graduate" && req.user.role !== "jobseeker") throw new UnauthorizedError("Only graduates and job seekers can apply");
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
    
    // Perform Aggregation to rank candidates efficiently
    const apps = await Application.aggregate([
      { $match: { job: job._id } },
      {
        $lookup: {
          from: "jobs",
          localField: "job",
          foreignField: "_id",
          as: "job"
        }
      },
      { $unwind: "$job" },
      {
        $lookup: {
          from: "users",
          localField: "applicant",
          foreignField: "_id",
          as: "applicant"
        }
      },
      { $unwind: "$applicant" },
      {
        $addFields: {
          "searchableJobText": {
            $toLower: {
              $concat: [
                {
                  $reduce: {
                    input: { $ifNull: ["$job.skills", []] },
                    initialValue: "",
                    in: { $concat: ["$$value", " ", "$$this"] }
                  }
                },
                " ",
                { $ifNull: ["$job.qualifications", ""] },
                " ",
                { $ifNull: ["$job.requirements", ""] }
              ]
            }
          },
          "matchingSkillsCount": {
            $size: {
              $filter: {
                input: { $ifNull: ["$applicant.skills", []] },
                as: "userSkill",
                cond: {
                  $ne: [
                    { $indexOfCP: ["$searchableJobText", { $toLower: "$$userSkill" }] },
                    -1
                  ]
                }
              }
            }
          },
          "isTitleMatch": {
            $cond: [
              {
                $and: [
                  { $ne: ["$applicant.major", null] },
                  { $ne: ["$applicant.major", ""] },
                  {
                    $ne: [
                      {
                        $indexOfCP: [
                          { $toLower: "$job.title" },
                          { $toLower: "$applicant.major" }
                        ]
                      },
                      -1
                    ]
                  }
                ]
              },
              true,
              false
            ]
          }
        }
      },
      {
        $addFields: {
          "matchScore": {
            $add: [
              { $multiply: ["$matchingSkillsCount", 2] }, // Enhanced: 2 points per matching skill
              { $cond: ["$isTitleMatch", 3, 0] }          // Enhanced: 3 points for title match
            ]
          },
          "matchReason": {
            $let: {
              vars: {
                reasons: {
                  $filter: {
                    input: [
                      {
                        $cond: [
                          { $gt: ["$matchingSkillsCount", 0] },
                          { $concat: [{ $toString: "$matchingSkillsCount" }, " matching skills"] },
                          null
                        ]
                      },
                      {
                        $cond: ["$isTitleMatch", "Matches Major", null]
                      }
                    ],
                    as: "reason",
                    cond: { $ne: ["$$reason", null] }
                  }
                }
              },
              in: {
                $cond: [
                  { $gt: [{ $size: "$$reasons" }, 0] },
                  {
                    $reduce: {
                      input: "$$reasons",
                      initialValue: "",
                      in: {
                        $cond: [
                          { $eq: ["$$value", ""] },
                          "$$this",
                          { $concat: ["$$value", ", ", "$$this"] }
                        ]
                      }
                    }
                  },
                  "General Match"
                ]
              }
            }
          }
        }
      },
      {
        $project: {
          _id: 1,
          status: 1,
          createdAt: 1,
          updatedAt: 1,
          job: {
            _id: "$job._id",
            title: "$job.title",
            location: "$job.location",
            category: "$job.category",
            type: "$job.type",
            skills: "$job.skills",
            qualifications: "$job.qualifications",
            requirements: "$job.requirements"
          },
          applicant: {
            _id: "$applicant._id",
            fullName: "$applicant.fullName",
            email: "$applicant.email",
            resume: "$applicant.resume",
            avatar: "$applicant.avatar",
            skills: "$applicant.skills",
            major: "$applicant.major"
          },
          matchScore: 1,
          matchReason: 1
        }
      },
      { $sort: { createdAt: -1 } }
    ]);

    res.status(StatusCodes.OK).json(apps);
  } catch (error) { next(error); }
};

const getApplicationById = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const app = await Application.findById(req.params.id)
      .populate("job", "title company")
      .populate("applicant", "fullName degree email avatar bio resume skills verifiedSkills experiences internships education projects portfolio linkedin phone address awards certifications languages github website");
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
