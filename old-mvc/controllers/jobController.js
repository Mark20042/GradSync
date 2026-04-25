const Job = require("../models/Job");
const User = require("../models/User");
const Application = require("../models/Application");
const SavedJob = require("../models/SavedJob");

//@desc    Create a new job (employer only)
// controllers/jobController.js
exports.createJob = async (req, res) => {
  try {
    if (req.user.role !== "employer") {
      return res.status(403).json({ message: "Only employers can post jobs" });
    }

    const job = new Job({
      ...req.body,
      company: req.user._id, // ✅ enforce company from logged-in user
    });

    await job.save();

    res.status(201).json(job);
  } catch (error) {
    console.error("Job creation error:", error);
    res.status(500).json({ message: error.message || "Server error" });
  }
};

//@desc    Get all jobs with filtering, searching, and pagination if job closed is false only
exports.getJobs = async (req, res) => {
  const { keyword, location, type, minSalary, maxSalary, userId, category } =
    req.query;

  try {
    const query = {
      isClosed: false,
      ...(keyword && { title: { $regex: keyword, $options: "i" } }),
      ...(location && { location: { $regex: location, $options: "i" } }),
      ...(category && { category }),
      ...(type && { type }),
      ...(req.query.company && { company: req.query.company }),
    };

    const andConditions = [];
    if (minSalary && !isNaN(minSalary)) {
      // Show jobs where the job's max salary is at least the user's min
      andConditions.push({ salaryMax: { $gte: Number(minSalary) } });
    }
    if (maxSalary && !isNaN(maxSalary)) {
      // Show jobs where the job's min salary is at most the user's max
      andConditions.push({ salaryMin: { $lte: Number(maxSalary) } });
    }
    if (andConditions.length > 0) {
      query.$and = andConditions;
    }

    const jobs = await Job.find(query).populate(
      "company",
      "fullName companyName companyLogo",
    );

    let saveJobIds = [];
    let appliedJobStatusMap = {};

    if (userId) {
      const savedJobs = await SavedJob.find({ graduate: userId }).select("job");
      saveJobIds = savedJobs.map((s) => String(s.job));

      const applications = await Application.find({ applicant: userId }).select(
        "job status",
      );
      applications.forEach((app) => {
        appliedJobStatusMap[String(app.job)] = app.status;
      });
    }

    const jobsWithExtras = jobs.map((job) => {
      const jobIdStr = String(job._id);
      return {
        ...job.toObject(),
        isSaved: saveJobIds.includes(jobIdStr),
        applicationStatus: appliedJobStatusMap[jobIdStr] || null,
      };
    });

    res.json(jobsWithExtras);
  } catch (error) {
    console.error("Error in getJobs:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

//@desc    Get recommended jobs for the graduate
exports.getRecommendedJobs = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const userSkills = user.skills?.map((s) => s.toLowerCase()) || [];
    const preferredLocation =
      user.jobPreferences?.preferredLocation?.toLowerCase() ||
      user.address?.toLowerCase() ||
      "";

    // Fetch all active jobs
    const jobs = await Job.find({ isClosed: false }).populate(
      "company",
      "fullName companyName companyLogo",
    );

    // Fetch saved jobs and application statuses
    const savedJobs = await SavedJob.find({ graduate: userId }).select("job");
    const saveJobIds = savedJobs.map((s) => String(s.job));

    const applications = await Application.find({ applicant: userId }).select(
      "job status",
    );
    let appliedJobStatusMap = {};
    applications.forEach((app) => {
      appliedJobStatusMap[String(app.job)] = app.status;
    });

    let scoredJobs = jobs.map((job) => {
      let score = 0;
      let matchReasons = [];

      // Skill & Requirement match (+1 point each)
      const jobSkills = job.skills?.map((s) => s.toLowerCase()) || [];
      const jobRequirements = job.requirements
        ? job.requirements.toLowerCase()
        : "";

      let skillMatchCount = 0;

      // 1. Check against explicit job skills array (if it exists)
      jobSkills.forEach((skill) => {
        if (userSkills.includes(skill)) {
          score += 1;
          skillMatchCount++;
        }
      });

      // 2. Check if the user's skills are mentioned in the job's text requirements
      userSkills.forEach((userSkill) => {
        if (
          !jobSkills.includes(userSkill) &&
          jobRequirements.includes(userSkill)
        ) {
          score += 1;
          skillMatchCount++;
        }
      });

      if (skillMatchCount > 0) matchReasons.push("Matches your skills");

      // Location match (+2 points)
      if (
        preferredLocation &&
        job.location &&
        job.location.toLowerCase().includes(preferredLocation)
      ) {
        score += 2;
        matchReasons.push("Near you");
      }

      // Title/Category match (+2 points)
      const userJobTitle =
        user.jobPreferences?.desiredJobTitle?.toLowerCase() ||
        user.major?.toLowerCase() ||
        "";
      if (
        userJobTitle &&
        job.title &&
        job.title.toLowerCase().includes(userJobTitle)
      ) {
        score += 2;
        matchReasons.push("Matches your profile");
      }

      let primaryReason =
        matchReasons.length > 0
          ? matchReasons[matchReasons.length - 1]
          : "Recommended";
      if (matchReasons.includes("Near you")) {
        primaryReason = "Near you"; // Prioritize Location
      } else if (matchReasons.includes("Matches your skills")) {
        primaryReason = "Matches your skills";
      }

      const jobIdStr = String(job._id);
      return {
        ...job.toObject(),
        matchScore: score,
        matchReason: primaryReason,
        isSaved: saveJobIds.includes(jobIdStr),
        applicationStatus: appliedJobStatusMap[jobIdStr] || null,
      };
    });

    // Filter jobs that have at least some match (score > 0)
    scoredJobs = scoredJobs.filter((job) => job.matchScore > 0);

    // Sort by descending score
    scoredJobs.sort((a, b) => b.matchScore - a.matchScore);

    // Return the top 6 recommended jobs
    res.status(200).json(scoredJobs.slice(0, 6));
  } catch (error) {
    console.error("Error in getRecommendedJobs:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

//@desc    Get jobs posted by the logged-in employer
exports.getJobsEmployer = async (req, res) => {
  try {
    const userId = req.user._id;
    const { role } = req.user;

    if (role !== "employer") {
      return res
        .status(403)
        .json({ message: "Only employers can access their jobs." });
    }
    const jobs = await Job.find({ company: userId })
      .populate("company", "fullName companyName companyLogo")
      .lean(); // Use .lean() to get plain JS objects so we can add new fields

    //count applications for each job    for (let job of jobs) {
    const jobsWithApplicationCounts = await Promise.all(
      jobs.map(async (job) => {
        const applicationCount = await Application.countDocuments({
          job: job._id,
        });
        return {
          ...job,
          applicationCount,
        };
      }),
    );
    res.status(200).json(jobsWithApplicationCounts);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

//@desc get job by id
exports.getJobById = async (req, res) => {
  try {
    const { userId } = req.query;

    let applicationStatus = null;
    let isSaved = false;

    const job = await Job.findById(req.params.id).populate(
      "company",
      "fullName companyName companyLogo",
    );

    if (userId) {
      const application = await Application.findOne({
        job: req.params.id,
        applicant: userId,
      }).select("status");

      if (application) {
        applicationStatus = application.status;
      }

      const savedJob = await SavedJob.findOne({
        job: req.params.id,
        graduate: userId,
      });

      if (savedJob) {
        isSaved = true;
      }
    }

    const jobData = { ...job.toObject(), applicationStatus, isSaved };

    res.status(200).json(jobData);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

//@desc    Update a job (employer only)
exports.updateJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }
    if (job.company.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to update this job" });
    }
    Object.assign(job, req.body);

    const updated = await job.save();

    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

//@desc    Delete a job (employer only)
exports.deleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }
    if (job.company.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this job" });
    }

    await job.deleteOne();

    res.status(200).json({ message: "Job deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

//@desc    Toggle job open/close (employer only)
exports.toggleCloseJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }
    if (job.company.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to close this job" });
    }

    job.isClosed = !job.isClosed;
    await job.save();

    res.json({ message: "Job marked as closed" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
