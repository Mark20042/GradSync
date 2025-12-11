const User = require("../models/User");
const Job = require("../models/Job");
const Application = require("../models/Application");

// @desc    Get system analytics
// @route   GET /api/admin/analytics
// @access  Private/Admin
exports.getAnalytics = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalGraduates = await User.countDocuments({ role: "graduate" });
        const totalEmployers = await User.countDocuments({ role: "employer" });
        const totalJobs = await Job.countDocuments();
        const activeJobs = await Job.countDocuments({ isClosed: false });
        const totalApplications = await Application.countDocuments();
        const hiredApplications = await Application.countDocuments({ status: "Accepted" });
        const firedApplications = await Application.countDocuments({ status: "Rejected" });
        const pendingApplications = await Application.countDocuments({ status: "In Review" });
        const appliedApplications = await Application.countDocuments({ status: "Applied" });

        // Get recent users (last 5)
        const recentUsers = await User.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .select("fullName email role createdAt");

        // Get job categories distribution
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
                firedApplications,
                pendingApplications,
                appliedApplications,
            },
            recentUsers,
            jobCategories,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select("-password").sort({ createdAt: -1 });
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (user) {
            await user.deleteOne();
            res.json({ message: "User removed" });
        } else {
            res.status(404).json({ message: "User not found" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all jobs
// @route   GET /api/admin/jobs
// @access  Private/Admin
exports.getAllJobs = async (req, res) => {
    try {
        const jobs = await Job.find()
            .populate("company", "companyName email")
            .sort({ createdAt: -1 });
        res.json(jobs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete job
// @route   DELETE /api/admin/jobs/:id
// @access  Private/Admin
exports.deleteJob = async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);
        if (job) {
            await job.deleteOne();
            res.json({ message: "Job removed" });
        } else {
            res.status(404).json({ message: "Job not found" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get comprehensive report data
// @route   GET /api/admin/reports
// @access  Private/Admin
exports.getReports = async (req, res) => {
    try {
        const FAQ = require("../models/FAQ");
        const JobFAQ = require("../models/JobFAQ");
        const EmployerSettings = require("../models/EmployerSettings");

        // Fetch comprehensive data for reports
        const users = await User.find().select("-password");
        const jobs = await Job.find().populate("company", "companyName");
        const applications = await Application.find()
            .populate("applicant", "fullName email")
            .populate({
                path: "job",
                select: "title company",
                populate: {
                    path: "company",
                    select: "companyName",
                },
            });

        // Fetch FAQs
        const faqs = await FAQ.find().sort({ order: 1 });

        // Fetch Job FAQs
        const jobFaqs = await JobFAQ.find()
            .populate("employer", "fullName companyName")
            .populate("job", "title");

        // Fetch Employer Settings
        const employerSettings = await EmployerSettings.find()
            .populate("user", "fullName companyName email");

        res.json({
            users,
            jobs,
            applications,
            faqs,
            jobFaqs,
            employerSettings,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update job
// @route   PUT /api/admin/jobs/:id
// @access  Private/Admin
exports.updateJob = async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);
        if (job) {
            job.title = req.body.title || job.title;
            job.description = req.body.description || job.description;
            job.requirements = req.body.requirements || job.requirements;
            job.category = req.body.category || job.category;
            job.type = req.body.type || job.type;
            job.salaryMin = req.body.salaryMin !== undefined ? req.body.salaryMin : job.salaryMin;
            job.salaryMax = req.body.salaryMax !== undefined ? req.body.salaryMax : job.salaryMax;
            job.location = req.body.location || job.location;
            job.isClosed = req.body.isClosed !== undefined ? req.body.isClosed : job.isClosed;
            job.autoReplyMessage = req.body.autoReplyMessage !== undefined ? req.body.autoReplyMessage : job.autoReplyMessage;

            const updatedJob = await job.save();
            res.json(updatedJob);
        } else {
            res.status(404).json({ message: "Job not found" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update user
// @route   PUT /api/admin/users/:id
// @access  Private/Admin
exports.updateUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (user) {
            // Basic Info
            user.fullName = req.body.fullName || user.fullName;
            user.email = req.body.email || user.email;
            user.role = req.body.role || user.role;
            user.phone = req.body.phone || user.phone;
            user.address = req.body.address || user.address;
            user.website = req.body.website || user.website;

            // Graduate Specific
            if (user.role === 'graduate') {
                user.university = req.body.university || user.university;
                user.degree = req.body.degree || user.degree;
                user.major = req.body.major || user.major;
                user.graduationYear = req.body.graduationYear || user.graduationYear;
                user.linkedin = req.body.linkedin || user.linkedin;
                user.github = req.body.github || user.github;
                user.portfolio = req.body.portfolio || user.portfolio;

                // New fields
                if (req.body.jobPreferences) user.jobPreferences = { ...user.jobPreferences, ...req.body.jobPreferences };
                if (req.body.skills) user.skills = req.body.skills;
                if (req.body.experiences) user.experiences = req.body.experiences;
                if (req.body.internships) user.internships = req.body.internships;
                if (req.body.languages) user.languages = req.body.languages;
                if (req.body.awards) user.awards = req.body.awards;
                if (req.body.certifications) user.certifications = req.body.certifications;
                if (req.body.projects) user.projects = req.body.projects;
            }

            // Employer Specific
            if (user.role === 'employer') {
                user.companyName = req.body.companyName || user.companyName;
                user.companyDescription = req.body.companyDescription || user.companyDescription;
            }

            const updatedUser = await user.save();
            res.json(updatedUser);
        } else {
            res.status(404).json({ message: "User not found" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get user saved jobs
// @route   GET /api/admin/users/:id/saved-jobs
// @access  Private/Admin
exports.getUserSavedJobs = async (req, res) => {
    try {
        const SavedJob = require("../models/SavedJob");
        const savedJobs = await SavedJob.find({ graduate: req.params.id })
            .populate({
                path: "job",
                populate: { path: "company", select: "companyName" }
            });
        res.json(savedJobs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all FAQs
// @route   GET /api/admin/faqs
// @access  Private/Admin
exports.getFAQs = async (req, res) => {
    try {
        const FAQ = require("../models/FAQ");
        const faqs = await FAQ.find().sort({ order: 1 });
        res.json(faqs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create FAQ
// @route   POST /api/admin/faqs
// @access  Private/Admin
exports.createFAQ = async (req, res) => {
    try {
        const FAQ = require("../models/FAQ");
        const faq = new FAQ(req.body);
        const createdFAQ = await faq.save();
        res.status(201).json(createdFAQ);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update FAQ
// @route   PUT /api/admin/faqs/:id
// @access  Private/Admin
exports.updateFAQ = async (req, res) => {
    try {
        const FAQ = require("../models/FAQ");
        const faq = await FAQ.findById(req.params.id);
        if (faq) {
            faq.question = req.body.question || faq.question;
            faq.answer = req.body.answer || faq.answer;
            faq.category = req.body.category || faq.category;
            faq.order = req.body.order !== undefined ? req.body.order : faq.order;
            faq.isActive = req.body.isActive !== undefined ? req.body.isActive : faq.isActive;

            const updatedFAQ = await faq.save();
            res.json(updatedFAQ);
        } else {
            res.status(404).json({ message: "FAQ not found" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete FAQ
// @route   DELETE /api/admin/faqs/:id
// @access  Private/Admin
exports.deleteFAQ = async (req, res) => {
    try {
        const FAQ = require("../models/FAQ");
        const faq = await FAQ.findById(req.params.id);
        if (faq) {
            await faq.deleteOne();
            res.json({ message: "FAQ removed" });
        } else {
            res.status(404).json({ message: "FAQ not found" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create Employer Settings
// @route   POST /api/admin/employer-settings
// @access  Private/Admin
exports.createEmployerSettings = async (req, res) => {
    try {
        const EmployerSettings = require("../models/EmployerSettings");
        const { user, timezone, businessHours, autoReplyMessage } = req.body;

        const existingSettings = await EmployerSettings.findOne({ user });
        if (existingSettings) {
            return res.status(400).json({ message: "Settings for this employer already exist" });
        }

        const settings = new EmployerSettings({
            user,
            timezone,
            businessHours,
            autoReplyMessage,
        });

        const createdSettings = await settings.save();
        await createdSettings.populate("user", "fullName email companyName");
        res.status(201).json(createdSettings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all employer settings
// @route   GET /api/admin/employer-settings
// @access  Private/Admin
exports.getAllEmployerSettings = async (req, res) => {
    try {
        const EmployerSettings = require("../models/EmployerSettings");
        const settings = await EmployerSettings.find()
            .populate("user", "fullName email companyName");
        res.json(settings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update employer settings
// @route   PUT /api/admin/employer-settings/:id
// @access  Private/Admin
exports.updateEmployerSettings = async (req, res) => {
    try {
        const EmployerSettings = require("../models/EmployerSettings");
        const settings = await EmployerSettings.findById(req.params.id);
        if (settings) {
            settings.timezone = req.body.timezone || settings.timezone;
            settings.businessHours = req.body.businessHours || settings.businessHours;
            settings.autoReplyMessage = req.body.autoReplyMessage || settings.autoReplyMessage;

            const updatedSettings = await settings.save();
            res.json(updatedSettings);
        } else {
            res.status(404).json({ message: "Settings not found" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all Job FAQs
// @route   GET /api/admin/job-faqs
// @access  Private/Admin
exports.getJobFAQs = async (req, res) => {
    try {
        const JobFAQ = require("../models/JobFAQ");
        const jobFaqs = await JobFAQ.find()
            .populate("employer", "fullName email companyName")
            .populate("job", "title")
            .sort({ createdAt: -1 });
        res.json(jobFaqs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create Job FAQ
// @route   POST /api/admin/job-faqs
// @access  Private/Admin
exports.createJobFAQ = async (req, res) => {
    try {
        const JobFAQ = require("../models/JobFAQ");
        const jobFAQ = new JobFAQ(req.body);
        const createdJobFAQ = await jobFAQ.save();

        // Populate for return
        await createdJobFAQ.populate("employer", "fullName email companyName");
        if (createdJobFAQ.job) await createdJobFAQ.populate("job", "title");

        res.status(201).json(createdJobFAQ);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update Job FAQ
// @route   PUT /api/admin/job-faqs/:id
// @access  Private/Admin
exports.updateJobFAQ = async (req, res) => {
    try {
        const JobFAQ = require("../models/JobFAQ");
        const jobFAQ = await JobFAQ.findById(req.params.id);
        if (jobFAQ) {
            jobFAQ.question = req.body.question || jobFAQ.question;
            jobFAQ.answer = req.body.answer || jobFAQ.answer;
            jobFAQ.keywords = req.body.keywords || jobFAQ.keywords;
            jobFAQ.employer = req.body.employer || jobFAQ.employer;
            // Allow setting job to null/undefined if it's a general employer FAQ
            if (req.body.job !== undefined) jobFAQ.job = req.body.job;

            const updatedJobFAQ = await jobFAQ.save();
            await updatedJobFAQ.populate("employer", "fullName email companyName");
            if (updatedJobFAQ.job) await updatedJobFAQ.populate("job", "title");

            res.json(updatedJobFAQ);
        } else {
            res.status(404).json({ message: "Job FAQ not found" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete Job FAQ
// @route   DELETE /api/admin/job-faqs/:id
// @access  Private/Admin
exports.deleteJobFAQ = async (req, res) => {
    try {
        const JobFAQ = require("../models/JobFAQ");
        const jobFAQ = await JobFAQ.findById(req.params.id);
        if (jobFAQ) {
            await jobFAQ.deleteOne();
            res.json({ message: "Job FAQ removed" });
        } else {
            res.status(404).json({ message: "Job FAQ not found" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create User
// @route   POST /api/admin/users
// @access  Private/Admin
exports.createUser = async (req, res) => {
    try {
        const { email, password, role } = req.body;
        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({ message: "User already exists" });
        }

        // Build user object with all provided fields
        const userData = {
            ...req.body,
            password, // Keep password from body
        };

        // Set required defaults if not provided
        if (role === 'graduate' && !userData.degree) {
            userData.degree = 'Not Specified';
        }
        if (role === 'employer' && !userData.companyName) {
            userData.companyName = 'Not Specified';
        }

        // Clean up empty strings for enum fields to avoid validation errors
        if (userData.jobPreferences) {
            if (!userData.jobPreferences.jobType || userData.jobPreferences.jobType === '') {
                delete userData.jobPreferences.jobType;
            }
        }

        // For employers, remove graduate-specific fields entirely
        if (role === 'employer') {
            delete userData.degree;
            delete userData.university;
            delete userData.major;
            delete userData.graduationYear;
            delete userData.jobPreferences;
            delete userData.skills;
            delete userData.experiences;
            delete userData.internships;
            delete userData.education;
            delete userData.awards;
            delete userData.certifications;
            delete userData.projects;
            delete userData.languages;
        }

        const user = await User.create(userData);

        // Return user without password
        const userResponse = user.toObject();
        delete userResponse.password;

        res.status(201).json(userResponse);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create Job
// @route   POST /api/admin/jobs
// @access  Private/Admin
exports.createJob = async (req, res) => {
    try {
        const job = new Job(req.body);
        const createdJob = await job.save();
        res.status(201).json(createdJob);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// @desc    Upload image (generic)
// @route   POST /api/admin/upload
// @access  Private/Admin
exports.uploadImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }
        const imageUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
        res.status(200).json({ imageUrl });
    } catch (error) {
        console.error("Error uploading image:", error);
        res.status(500).json({ message: "Error uploading image" });
    }
};
