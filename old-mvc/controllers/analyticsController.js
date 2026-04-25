const Job = require("../models/Job");
const Application = require("../models/Application");

// === Helper: Calculate trend percentage ===
const getTrend = (current, previous) => {
  if (previous === 0) return current > 0 ? 1 : 0;
  return Math.round(((current - previous) / previous) * 100);
};

exports.getEmployerAnalytics = async (req, res) => {
  try {
    if (req.user.role !== "employer") {
      return res
        .status(403)
        .json({ message: "Only employers can access analytics." });
    }

    const companyId = req.user._id;
    const now = new Date();

    // === JOBS & APPLICATIONS SUMMARY ===
    const jobs = await Job.find({ company: companyId }).select("_id").lean();
    const jobIds = jobs.map((j) => j._id);

    const [totalActiveJobs, totalApplications, totalHired] = await Promise.all([
      Job.countDocuments({ company: companyId, isClosed: false }),
      Application.countDocuments({ job: { $in: jobIds } }),
      Application.countDocuments({ job: { $in: jobIds }, status: "Accepted" }),
    ]);

    // === TRENDS (7 days comparison) ===
    const last7Days = new Date(now);
    last7Days.setDate(last7Days.getDate() - 7);

    const prev7Days = new Date(now);
    prev7Days.setDate(prev7Days.getDate() - 14);

    const [activeJobLast7, activeJobPrev7] = await Promise.all([
      Job.countDocuments({
        company: companyId,
        createdAt: { $gte: last7Days },
      }),
      Job.countDocuments({
        company: companyId,
        createdAt: { $gte: prev7Days, $lt: last7Days },
      }),
    ]);

    const [applicationLast7, applicationPrev7] = await Promise.all([
      Application.countDocuments({
        job: { $in: jobIds },
        createdAt: { $gte: last7Days, $lte: now },
      }),
      Application.countDocuments({
        job: { $in: jobIds },
        createdAt: { $gte: prev7Days, $lt: last7Days },
      }),
    ]);

    const [hiredLast7, hiredPrev7] = await Promise.all([
      Application.countDocuments({
        job: { $in: jobIds },
        status: "Accepted",
        createdAt: { $gte: last7Days, $lte: now },
      }),
      Application.countDocuments({
        job: { $in: jobIds },
        status: "Accepted",
        createdAt: { $gte: prev7Days, $lt: last7Days },
      }),
    ]);

    const trends = {
      activeJobs: getTrend(activeJobLast7, activeJobPrev7),
      applications: getTrend(applicationLast7, applicationPrev7),
      totalHired: getTrend(hiredLast7, hiredPrev7),
    };

    // === RECENT JOBS & APPLICATIONS ===
    const [recentJobs, recentApplications] = await Promise.all([
      Job.find({ company: companyId })
        .sort({ createdAt: -1 })
        .limit(5)
        .select("title location type createdAt isClosed"),
      Application.find({ job: { $in: jobIds } })
        .sort({ createdAt: -1 })
        .limit(5)
        .populate("applicant", "fullName email avatar")
        .populate("job", "title"),
    ]);

    // === CHART DATA (Applications per Job only) ===
    const applicationsPerJob = await Application.aggregate([
      { $match: { job: { $in: jobIds } } },
      { $group: { _id: "$job", count: { $sum: 1 } } },
      {
        $lookup: {
          from: "jobs",
          localField: "_id",
          foreignField: "_id",
          as: "job",
        },
      },
      { $unwind: "$job" },
      { $project: { job: "$job.title", applications: "$count" } },
    ]);

    // === CURRENT MONTH LABEL ===
    const currentMonth = now.toLocaleString("default", {
      month: "long",
      year: "numeric",
    });

    // === RESPONSE ===
    res.status(200).json({
      counts: { totalActiveJobs, totalApplications, totalHired },
      trends,
      applicationsPerJob, // ✅ only chart left
      currentMonth,
      data: { recentJobs, recentApplications },
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch analytics", error: error.message });
  }
};
