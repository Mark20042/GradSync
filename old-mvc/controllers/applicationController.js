const Application = require("../models/Application");
const Job = require("../models/Job");

//@desc    Apply to a job
exports.applyToJob = async (req, res) => {
  try {
    if (req.user.role !== "graduate") {
      return res
        .status(403)
        .json({ message: "Only graduates can apply to jobs" });
    }

    const existing = await Application.findOne({
      job: req.params.jobId,
      applicant: req.user._id,
    });

    if (existing) {
      return res
        .status(400)
        .json({ message: "You have already applied to this job" });
    }

    const application = await Application.create({
      job: req.params.jobId,
      applicant: req.user._id,
      resume: req.user.resume, // Assume resume is sent in the body
    });

    // Create notification for employer
    try {
      const { createNotification } = require("./notificationController");
      const job = await Job.findById(req.params.jobId).populate('company', 'fullName');

      if (job && job.company) {
        await createNotification(
          job.company._id,
          "APPLICATION",
          "New Application Received",
          `${req.user.fullName || "A candidate"} applied to your job: ${job.title}`,
          application._id
        );
      }
    } catch (notifError) {
      console.error("Error creating notification:", notifError);
      // Don't fail the application if notification fails
    }

    res.status(201).json(application);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//desc get logged-in user's applications
exports.getMyApplications = async (req, res) => {
  try {
    const apps = await Application.find({
      applicant: req.user._id,
    })
      .populate({
        path: "job",
        select: "title location type company",
        populate: {
          path: "company",
          select: "companyName fullName",
        },
      })
      .sort({ createdAt: -1 });

    res.status(200).json(apps);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//@desc    Get applicants for a specific job (for employers)
exports.getApplicantsForJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId);

    if (!job || job.company.toString() !== req.user._id.toString()) {
      return res.status(404).json({
        message: "You are not authorized to view applicants for this job",
      });
    }

    const applications = await Application.find({ job: req.params.jobId })
      .populate("job", "title location category type")
      .populate("applicant", "fullName email resume avatar ");

    res.status(200).json(applications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//@desc    Get application by ID
exports.getApplicationById = async (req, res) => {
  try {
    const app = await Application.findById(req.params.id)
      .populate("job", " title company")
      .populate(
        "applicant",
        "fullName degree email avatar bio resume skills verifiedSkills experiences internships education projects portfolio linkedin phone address awards certifications languages"
      );

    if (!app) {
      return res
        .status(404)
        .json({ message: "Application not found", id: req.params.id });
    }

    const isOwner =
      app.applicant._id.toString() === req.user._id.toString() ||
      app.job.company.toString() === req.user._id.toString();

    if (!isOwner) {
      return res
        .status(403)
        .json({ message: "You are not authorized to view this application" });
    }

    res.status(200).json(app);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//@desc    Update application status (for employers)
exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const app = await Application.findById(req.params.id).populate("job");

    if (!app || app.job.company.toString() !== req.user._id.toString()) {
      return res.status(404).json({
        message: "Not authorized to update this application",
      });
    }

    app.status = status;
    await app.save();

    res.json({ message: "Application status updated", status });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
