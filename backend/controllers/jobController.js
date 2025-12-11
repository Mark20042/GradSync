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

  try {
    const jobs = await Job.find(query).populate(
      "company",
      "fullName companyName companyLogo"
    );

    let saveJobIds = [];
    let appliedJobStatusMap = {};

    if (userId) {
      const savedJobs = await SavedJob.find({ graduate: userId }).select(
        "job"
      );
      saveJobIds = savedJobs.map((s) => String(s.job));

      const applications = await Application.find({ applicant: userId }).select(
        "job status"
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
      })
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

    const job = await Job.findById(req.params.id).populate(
      "company",
      "fullName companyName companyLogo"
    );

    if (userId) {
      const application = await Application.findOne({
        job: req.params.id,
        applicant: userId,
      }).select("status");

      if (application) {
        applicationStatus = application.status;
      }
    }

    res.status(200).json({ ...job.toObject(), applicationStatus });
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
