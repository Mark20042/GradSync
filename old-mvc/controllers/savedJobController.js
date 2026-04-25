const SavedJobs = require("../models/SavedJob");

//@desc  Save a job (jobseeker only)
exports.saveJob = async (req, res) => {
  try {
    const exists = await SavedJobs.findOne({
      job: req.params.jobId,
      graduate: req.user._id,
    });

    if (exists) {
      return res.status(400).json({ message: "Job already saved" });
    }

    const saved = await SavedJobs.create({
      job: req.params.jobId,
      graduate: req.user._id,
    });

    res.status(201).json(saved);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to save job", error: error.message });
  }
};

//@desc  Unsave a job (jobseeker only)
exports.unsaveJob = async (req, res) => {
  try {
    await SavedJobs.findOneAndDelete({
      job: req.params.jobId,
      graduate: req.user._id,
    });

    res.status(200).json({ message: "Job removed from saved list" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to unsave job", error: error.message });
  }
};

//@desc  Get all saved jobs for the logged-in jobseeker
exports.getSavedJobs = async (req, res) => {
  try {
    const savedJobs = await SavedJobs.find({ graduate: req.user._id }).populate(
      {
        path: "job",
        populate: {
          path: "company",
          select: "fullName CompanyName companyLogo",
        },
      }
    );
    res.status(200).json(savedJobs);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to get saved jobs", error: error.message });
  }
};
