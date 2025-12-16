const User = require("../models/User");
const Job = require("../models/Job");
const { analyzeJobSuitability } = require("../ai_services/ollamaService");

// @desc    Check job suitability using AI
// @route   POST /api/ai/suitability
// @access  Private
exports.checkSuitability = async (req, res) => {
    try {
        const { jobId } = req.body;
        const userId = req.user._id;

        // 1. Fetch User Profile
        const user = await User.findById(userId).select(
            "degree major skills experiences education"
        );
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // 2. Fetch Job Details
        const job = await Job.findById(jobId).select(
            "title description requirements"
        );
        if (!job) {
            return res.status(404).json({ message: "Job not found" });
        }

        // 3. Call AI Service
        const result = await analyzeJobSuitability(user, job);

        res.status(200).json(result);
    } catch (error) {
        console.error("AI Suitability Check Error:", error);
        res.status(500).json({ message: "Failed to analyze suitability" });
    }
};

// @desc    Generate AI Summary for User Profile
// @route   POST /api/ai/summary
// @access  Private
exports.generateSummary = async (req, res) => {
    try {
        const userId = req.user._id;

        // Fetch User Profile with all necessary fields
        const user = await User.findById(userId).select(
            "degree major skills experiences education"
        );

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const { generateAISummary } = require("../ai_services/ollamaService");
        const result = await generateAISummary(user);

        res.status(200).json(result);
    } catch (error) {
        console.error("AI Summary Generation Error:", error);
        res.status(500).json({ message: "Failed to generate summary" });
    }
};

// @desc    Scan for job matches and notify user
// @route   POST /api/ai/scan-matches
// @access  Private
exports.scanForMatches = async (req, res) => {
    try {
        const userId = req.user._id;
        const { createNotification } = require("./notificationController");
        const { analyzeJobSuitability } = require("../ai_services/ollamaService");

        // 1. Fetch User Profile (including job preferences)
        const user = await User.findById(userId).select(
            "degree major skills experiences education jobPreferences lastScanDate"
        );

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // 2. Determine the date to scan from (only new jobs since last scan)
        const scanFromDate = user.lastScanDate
            ? new Date(user.lastScanDate)
            : new Date(Date.now() - 24 * 60 * 60 * 1000); // Default: last 24 hours

        // 3. Build job query based on user preferences
        const jobQuery = {
            createdAt: { $gt: scanFromDate },
            isClosed: { $ne: true } // Only open jobs
        };

        // Filter by job preferences if available
        if (user.jobPreferences) {
            if (user.jobPreferences.preferredLocation) {
                jobQuery.location = {
                    $regex: user.jobPreferences.preferredLocation,
                    $options: 'i'
                };
            }
            if (user.jobPreferences.jobType) {
                jobQuery.type = user.jobPreferences.jobType;
            }
            if (user.jobPreferences.industry) {
                jobQuery.category = {
                    $regex: user.jobPreferences.industry,
                    $options: 'i'
                };
            }
        }

        // 4. Fetch matching jobs
        const recentJobs = await Job.find(jobQuery)
            .populate('company', 'companyName')
            .sort({ createdAt: -1 })
            .limit(10); // Limit to 10 to prevent AI overload

        let matchesFound = 0;

        // 5. Analyze each job
        for (const job of recentJobs) {
            try {
                const analysis = await analyzeJobSuitability(user, job);

                // 6. If score >= 80, create notification
                if (analysis.score >= 80) {
                    await createNotification(
                        userId,
                        "MATCH",
                        "New Job Match Found!",
                        `You are a ${analysis.score}% match for "${job.title}" at ${job.company?.companyName || "a company"}. Check it out!`,
                        job._id
                    );
                    matchesFound++;
                }
            } catch (err) {
                console.error(`Error analyzing job ${job._id}:`, err);
                // Continue to next job
            }
        }

        // 7. Update user's lastScanDate
        await User.findByIdAndUpdate(userId, { lastScanDate: new Date() });

        res.status(200).json({
            message: "Scan complete",
            matchesFound,
            jobsScanned: recentJobs.length,
            newJobsChecked: recentJobs.length
        });

    } catch (error) {
        console.error("AI Match Scan Error:", error);
        res.status(500).json({ message: "Failed to scan for matches" });
    }
};

// @desc    Check specific candidate suitability for employer
// @route   POST /api/ai/candidate-suitability
// @access  Private (Employer)
exports.checkCandidateSuitability = async (req, res) => {
    try {
        const { jobId, candidateId } = req.body;

        // 1. Fetch Candidate Profile
        const user = await User.findById(candidateId).select(
            "degree major skills experiences education"
        );
        if (!user) {
            return res.status(404).json({ message: "Candidate not found" });
        }

        // 2. Fetch Job Details
        const job = await Job.findById(jobId).select(
            "title description requirements"
        );
        if (!job) {
            return res.status(404).json({ message: "Job not found" });
        }

        // 3. Call AI Service
        const { analyzeJobSuitability } = require("../ai_services/ollamaService");
        const result = await analyzeJobSuitability(user, job);

        res.status(200).json(result);
    } catch (error) {
        console.error("AI Candidate Check Error:", error);
        res.status(500).json({ message: "Failed to analyze candidate" });
    }
};


