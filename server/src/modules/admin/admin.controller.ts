import type { Response } from "express";
import User from "../../shared/models/User.model.js";
import Job from "../../shared/models/Job.model.js";
import Application from "../../shared/models/Application.model.js";
import FAQ from "../../shared/models/FAQ.model.js";
import JobFAQ from "../../shared/models/JobFAQ.model.js";
import EmployerSettings from "../../shared/models/EmployerSettings.model.js";
import SavedJob from "../../shared/models/SavedJob.model.js";
import { env } from "../../shared/config/environment.js";
import {
  sendApprovalEmail,
  sendRejectionEmail,
} from "../../shared/utils/email.service.js";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const getAnalytics = async (req: any, res: Response) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalGraduates = await User.countDocuments({ role: "graduate" });
    const totalEmployers = await User.countDocuments({ role: "employer" });
    const totalJobs = await Job.countDocuments();
    const activeJobs = await Job.countDocuments({ isClosed: false });
    const totalApplications = await Application.countDocuments();
    const hiredApplications = await Application.countDocuments({
      status: "Accepted",
    });
    const rejectedApplications = await Application.countDocuments({
      status: "Rejected",
    });
    const pendingApplications = await Application.countDocuments({
      status: "In Review",
    });
    const appliedApplications = await Application.countDocuments({
      status: "Applied",
    });

    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select("fullName email role createdAt");

    const jobCategories = await Job.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } },
    ]);

    res.json({
      counts: {
        totalUsers,
        totalGraduates,
        totalEmployers,
        totalJobs,
        activeJobs,
        totalApplications,
        hiredApplications,
        rejectedApplications,
        pendingApplications,
        appliedApplications,
      },
      recentUsers,
      jobCategories,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllUsers = async (req: any, res: Response) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.json(users);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteUser = async (req: any, res: Response) => {
  try {
    const user = await User.findById(req.params.id);
    if (user) {
      await user.deleteOne();
      res.json({ message: "User removed" });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateUser = async (req: any, res: Response) => {
  try {
    const user = await User.findById(req.params.id);
    if (user) {
      const body = req.body;
      user.fullName = body.fullName || user.fullName;
      user.email = body.email || user.email;
      user.role = body.role || user.role;
      user.phone = body.phone || user.phone;
      user.address = body.address || user.address;
      user.website = body.website || user.website;
      user.verified =
        body.verified !== undefined ? body.verified : user.verified;

      if (user.role === "graduate") {
        user.university = body.university || user.university;
        user.degree = body.degree || user.degree;
        user.major = body.major || user.major;
        user.graduationYear = body.graduationYear || user.graduationYear;
        user.linkedin = body.linkedin || user.linkedin;
        user.github = body.github || user.github;
        user.portfolio = body.portfolio || user.portfolio;
        if (body.jobPreferences)
          user.jobPreferences = {
            ...user.jobPreferences,
            ...body.jobPreferences,
          };
        if (body.skills) user.skills = body.skills;
        if (body.experiences) user.experiences = body.experiences;
        if (body.internships) user.internships = body.internships;
        if (body.languages) user.languages = body.languages;
        if (body.awards) user.awards = body.awards;
        if (body.certifications) user.certifications = body.certifications;
        if (body.projects) user.projects = body.projects;
      }
      if (user.role === "employer") {
        user.companyName = body.companyName || user.companyName;
        user.companyDescription =
          body.companyDescription || user.companyDescription;
      }

      const updatedUser = await user.save();
      res.json(updatedUser);
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getUserSavedJobs = async (req: any, res: Response) => {
  try {
    const savedJobs = await SavedJob.find({ graduate: req.params.id }).populate(
      {
        path: "job",
        populate: { path: "company", select: "companyName" },
      },
    );
    res.json(savedJobs);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllJobs = async (req: any, res: Response) => {
  try {
    const jobs = await Job.find()
      .populate("company", "companyName email")
      .sort({ createdAt: -1 });
    res.json(jobs);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteJob = async (req: any, res: Response) => {
  try {
    const job = await Job.findById(req.params.id);
    if (job) {
      await job.deleteOne();
      res.json({ message: "Job removed" });
    } else {
      res.status(404).json({ message: "Job not found" });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateJob = async (req: any, res: Response) => {
  try {
    const job = await Job.findById(req.params.id);
    if (job) {
      const body = req.body;
      job.title = body.title || job.title;
      job.description = body.description || job.description;
      job.requirements = body.requirements || job.requirements;
      job.category = body.category || job.category;
      job.type = body.type || job.type;
      job.salaryMin =
        body.salaryMin !== undefined ? body.salaryMin : job.salaryMin;
      job.salaryMax =
        body.salaryMax !== undefined ? body.salaryMax : job.salaryMax;
      job.location = body.location || job.location;
      job.isClosed = body.isClosed !== undefined ? body.isClosed : job.isClosed;
      job.autoReplyMessage =
        body.autoReplyMessage !== undefined
          ? body.autoReplyMessage
          : job.autoReplyMessage;
      const updatedJob = await job.save();
      res.json(updatedJob);
    } else {
      res.status(404).json({ message: "Job not found" });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getReports = async (req: any, res: Response) => {
  try {
    const [users, jobs, applications, faqs, jobFaqs, employerSettings] =
      await Promise.all([
        User.find().select("-password"),
        Job.find().populate("company", "companyName"),
        Application.find()
          .populate("applicant", "fullName email")
          .populate({
            path: "job",
            select: "title company",
            populate: { path: "company", select: "companyName" },
          }),
        FAQ.find().sort({ order: 1 }),
        JobFAQ.find()
          .populate("employer", "fullName companyName")
          .populate("job", "title"),
        EmployerSettings.find().populate("user", "fullName companyName email"),
      ]);

    res.json({ users, jobs, applications, faqs, jobFaqs, employerSettings });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getFAQs = async (req: any, res: Response) => {
  try {
    const faqs = await FAQ.find().sort({ order: 1 });
    res.json(faqs);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const createFAQ = async (req: any, res: Response) => {
  try {
    const faq = new FAQ(req.body);
    const createdFAQ = await faq.save();
    res.status(201).json(createdFAQ);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateFAQ = async (req: any, res: Response) => {
  try {
    const faq = await FAQ.findById(req.params.id);
    if (faq) {
      faq.question = req.body.question || faq.question;
      faq.answer = req.body.answer || faq.answer;
      faq.category = req.body.category || faq.category;
      faq.order = req.body.order !== undefined ? req.body.order : faq.order;
      faq.isActive =
        req.body.isActive !== undefined ? req.body.isActive : faq.isActive;
      const updatedFAQ = await faq.save();
      res.json(updatedFAQ);
    } else {
      res.status(404).json({ message: "FAQ not found" });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteFAQ = async (req: any, res: Response) => {
  try {
    const faq = await FAQ.findById(req.params.id);
    if (faq) {
      await faq.deleteOne();
      res.json({ message: "FAQ removed" });
    } else {
      res.status(404).json({ message: "FAQ not found" });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getJobFAQs = async (req: any, res: Response) => {
  try {
    const jobFaqs = await JobFAQ.find()
      .populate("employer", "fullName email companyName")
      .populate("job", "title")
      .sort({ createdAt: -1 });
    res.json(jobFaqs);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const createJobFAQ = async (req: any, res: Response) => {
  try {
    const jobFAQ = new JobFAQ(req.body);
    await jobFAQ.save();
    await (jobFAQ as any).populate("employer", "fullName email companyName");
    if (jobFAQ.job) await (jobFAQ as any).populate("job", "title");
    res.status(201).json(jobFAQ);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateJobFAQ = async (req: any, res: Response) => {
  try {
    const jobFAQ = await JobFAQ.findById(req.params.id);
    if (jobFAQ) {
      jobFAQ.question = req.body.question || jobFAQ.question;
      jobFAQ.answer = req.body.answer || jobFAQ.answer;
      jobFAQ.keywords = req.body.keywords || jobFAQ.keywords;
      jobFAQ.employer = req.body.employer || jobFAQ.employer;
      if (req.body.job !== undefined) jobFAQ.job = req.body.job;
      await jobFAQ.save();
      await (jobFAQ as any).populate("employer", "fullName email companyName");
      if (jobFAQ.job) await (jobFAQ as any).populate("job", "title");
      res.json(jobFAQ);
    } else {
      res.status(404).json({ message: "Job FAQ not found" });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteJobFAQ = async (req: any, res: Response) => {
  try {
    const jobFAQ = await JobFAQ.findById(req.params.id);
    if (jobFAQ) {
      await jobFAQ.deleteOne();
      res.json({ message: "Job FAQ removed" });
    } else {
      res.status(404).json({ message: "Job FAQ not found" });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllEmployerSettings = async (req: any, res: Response) => {
  try {
    const settings = await EmployerSettings.find().populate(
      "user",
      "fullName email companyName",
    );
    res.json(settings);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const createEmployerSettings = async (req: any, res: Response) => {
  try {
    const { user, timezone, businessHours, autoReplyMessage } = req.body;
    const existing = await EmployerSettings.findOne({ user });
    if (existing) {
      res
        .status(400)
        .json({ message: "Settings for this employer already exist" });
      return;
    }
    const settings = new EmployerSettings({
      user,
      timezone,
      businessHours,
      autoReplyMessage,
    });
    await settings.save();
    await (settings as any).populate("user", "fullName email companyName");
    res.status(201).json(settings);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateEmployerSettings = async (req: any, res: Response) => {
  try {
    const settings = await EmployerSettings.findById(req.params.id);
    if (settings) {
      settings.timezone = req.body.timezone || settings.timezone;
      settings.businessHours = req.body.businessHours || settings.businessHours;
      settings.autoReplyMessage =
        req.body.autoReplyMessage || settings.autoReplyMessage;
      await settings.save();
      res.json(settings);
    } else {
      res.status(404).json({ message: "Settings not found" });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const createUser = async (req: any, res: Response) => {
  try {
    const { email, password, role } = req.body;
    const userExists = await User.findOne({ email });
    if (userExists) {
      res.status(400).json({ message: "User already exists" });
      return;
    }
    const userData = { ...req.body };
    if (role === "graduate" && !userData.degree)
      userData.degree = "Not Specified";
    if (role === "employer" && !userData.companyName)
      userData.companyName = "Not Specified";
    if (role === "employer") {
      [
        "degree",
        "university",
        "major",
        "graduationYear",
        "jobPreferences",
        "skills",
        "experiences",
        "internships",
        "education",
        "awards",
        "certifications",
        "projects",
        "languages",
      ].forEach((f) => delete userData[f]);
    }
    const user = await User.create(userData);
    const resp = user.toObject();
    delete resp.password;
    res.status(201).json(resp);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const createJob = async (req: any, res: Response) => {
  try {
    const job = new Job(req.body);
    await job.save();
    res.status(201).json(job);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const uploadImage = async (req: any, res: Response) => {
  try {
    if (!req.file) {
      res.status(400).json({ message: "No file uploaded" });
      return;
    }
    const host = env.BASE_URL || `${req.protocol}://${req.get("host")}`;
    const imageUrl = `${host}/uploads/${req.file.filename}`;
    res.status(200).json({ imageUrl });
  } catch (error: any) {
    res.status(500).json({ message: "Error uploading image" });
  }
};
