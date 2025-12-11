const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const { protect } = require("../middlewares/authMiddleware");
const EmployerSettings = require("../models/EmployerSettings");
const JobFAQ = require("../models/JobFAQ");

// --- Settings ---

// @desc    Get employer settings
// @route   GET /api/employer/settings
// @access  Private (Employer)
router.get("/settings", protect, async (req, res) => {
    try {
        let settings = await EmployerSettings.findOne({ user: req.user._id });
        if (!settings) {
            // Create default if not exists
            settings = await EmployerSettings.create({ user: req.user._id });
        }
        res.json(settings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Update employer settings
// @route   PUT /api/employer/settings
// @access  Private (Employer)
router.put("/settings", protect, async (req, res) => {
    try {
        const settings = await EmployerSettings.findOneAndUpdate(
            { user: req.user._id },
            req.body,
            { new: true, upsert: true }
        );
        res.json(settings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// --- FAQs ---

// @desc    Get all FAQs
// @route   GET /api/employer/faqs
// @access  Private (Employer)
router.get("/faqs", protect, async (req, res) => {
    try {
        const faqs = await JobFAQ.find({ employer: req.user._id });
        res.json(faqs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Create FAQ
// @route   POST /api/employer/faqs
// @access  Private (Employer)
router.post("/faqs", protect, async (req, res) => {
    try {
        // Remove keywords from the payload if it exists
        const { keywords, ...faqData } = req.body;

        const faq = await JobFAQ.create({
            employer: req.user._id,
            ...faqData
        });
        res.status(201).json(faq);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Update FAQ
// @route   PUT /api/employer/faqs/:id
// @access  Private (Employer)
router.put("/faqs/:id", protect, async (req, res) => {
    try {
        console.log(`[UPDATE FAQ] Updating FAQ ID: ${req.params.id}`);

        // Remove keywords from the update payload if it exists
        const { keywords, ...updateData } = req.body;

        const faq = await JobFAQ.findOneAndUpdate(
            { _id: req.params.id, employer: req.user._id },
            updateData,
            { new: true, runValidators: true }
        );

        if (!faq) {
            console.log(`[UPDATE FAQ] FAQ not found`);
            return res.status(404).json({ message: "FAQ not found" });
        }

        console.log(`[UPDATE FAQ] Successfully updated`);
        res.json(faq);
    } catch (error) {
        console.error(`[UPDATE FAQ ERROR]:`, error);
        res.status(500).json({ message: error.message });
    }
});

// @desc    Delete FAQ
// @route   DELETE /api/employer/faqs/:id
// @access  Private (Employer)
router.delete("/faqs/:id", protect, async (req, res) => {
    try {
        console.log(`\n[DELETE FAQ] ============ DELETE REQUEST ============`);
        console.log(`[DELETE FAQ] Requested FAQ ID: ${req.params.id}`);
        console.log(`[DELETE FAQ] Employer ID: ${req.user._id}`);

        // Debug: Let's see all FAQs for this employer
        const allEmployerFaqs = await JobFAQ.find({ employer: req.user._id }).lean();
        console.log(`[DELETE FAQ] Total FAQs for employer: ${allEmployerFaqs.length}`);

        if (allEmployerFaqs.length > 0) {
            console.log(`[DELETE FAQ] Sample FAQ IDs from DB:`);
            allEmployerFaqs.slice(0, 3).forEach(faq => {
                console.log(`  - ID: "${faq._id}" (type: ${typeof faq._id})`);
            });
        }

        // Try to find the specific FAQ
        const jobFAQ = await JobFAQ.findOne({ _id: req.params.id });

        if (!jobFAQ) {
            console.log(`[DELETE FAQ] ❌ FAQ NOT FOUND with ID: "${req.params.id}"`);
            console.log(`[DELETE FAQ] Checking if ID exists in any FAQ...`);
            const exists = allEmployerFaqs.find(f => f._id.toString() === req.params.id);
            console.log(`[DELETE FAQ] ID match found in employer FAQs: ${exists ? 'YES' : 'NO'}`);
            return res.status(404).json({ message: "FAQ not found" });
        }

        console.log(`[DELETE FAQ] ✓ FAQ found!`);
        console.log(`[DELETE FAQ] FAQ employer: ${jobFAQ.employer}`);
        console.log(`[DELETE FAQ] Request employer: ${req.user._id}`);

        // Check authorization
        if (jobFAQ.employer.toString() !== req.user._id.toString()) {
            console.log(`[DELETE FAQ] ❌ Unauthorized`);
            return res.status(403).json({ message: "Unauthorized" });
        }

        await jobFAQ.deleteOne();
        console.log(`[DELETE FAQ] ✓ Successfully deleted FAQ`);
        console.log(`[DELETE FAQ] ============ END ============\n`);
        res.json({ message: "FAQ removed" });
    } catch (error) {
        console.error(`[DELETE FAQ] ❌ ERROR:`, error);
        res.status(500).json({ message: error.message });
    }
});

// @desc    Get public FAQs for a specific employer
// @route   GET /api/employer/:employerId/public-faqs
// @access  Private (Authenticated users)
router.get("/:employerId/public-faqs", protect, async (req, res) => {
    try {
        const faqs = await JobFAQ.find({ employer: req.params.employerId })
            .populate("job", "title");
        res.json(faqs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
