import type { Response } from 'express';
import User from '@/models/User.model.js';
import Job from '@/models/Job.model.js';
import { getOllamaService } from '@/services/ai/ollama.service.js';
import { getGeminiService } from '@/services/ai/gemini.service.js';
import { env } from '@/config/environment.js';
import { createNotification } from '@/utils/notification.helper.js';
import type { AuthenticatedRequest } from '@/interfaces/base.interfaces.js';
import type {
  SuitabilityRequestBody,
  CandidateSuitabilityRequestBody,
  UserProfileForAI,
} from '@/interfaces/ai.interfaces.js';
import FeatureFeedback from '@/models/FeatureFeedback.model.js';

// Choose AI service dynamically
const getAIService = () => {
  return getGeminiService();
};

// ─── Check Job Suitability ──────────────────────────────────────────────

/**
 * @desc    Check job suitability using AI
 * @route   POST /api/ai/suitability
 * @access  Private
 */
export const checkSuitability = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { jobId } = req.body as SuitabilityRequestBody;
    const userId = req.user._id;

    // 1. Fetch User Profile
    const user = await User.findById(userId).select(
      'degree major skills experiences education verifiedSkills'
    );
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    // 2. Fetch Job Details
    const job = await Job.findById(jobId).select('title description requirements qualifications skills');
    if (!job) {
      res.status(404).json({ message: 'Job not found' });
      return;
    }

    // 3. Call AI Service
    const aiService = getAIService();
    const result = await aiService.analyzeJobSuitability(
      user as unknown as UserProfileForAI,
      job
    );

    res.status(200).json(result);
  } catch (error) {
    console.error('AI Suitability Check Error:', error);
    res.status(500).json({ message: 'Failed to analyze suitability' });
  }
};

// ─── Generate AI Summary ────────────────────────────────────────────────

/**
 * @desc    Generate AI Summary for User Profile
 * @route   POST /api/ai/summary
 * @access  Private
 */
export const generateSummary = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId).select(
      'degree major skills experiences education verifiedSkills'
    );

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    const aiService = getAIService();
    const result = await aiService.generateAISummary(
      user as unknown as UserProfileForAI
    );

    res.status(200).json(result);
  } catch (error) {
    console.error('AI Summary Generation Error:', error);
    res.status(500).json({ message: 'Failed to generate summary' });
  }
};

// ─── Scan for Job Matches ───────────────────────────────────────────────

/**
 * @desc    Scan for job matches and notify user
 * @route   POST /api/ai/scan-matches
 * @access  Private
 */
export const scanForMatches = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user._id;

    // 1. Fetch User Profile (including job preferences)
    const user = await User.findById(userId).select(
      'degree major skills experiences education jobPreferences lastScanDate verifiedSkills'
    );

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    // 2. Determine the date to scan from (only new jobs since last scan)
    const scanFromDate = user.lastScanDate
      ? new Date(user.lastScanDate)
      : new Date(Date.now() - 24 * 60 * 60 * 1000); // Default: last 24 hours

    // 3. Build job query based on user preferences
    const jobQuery: Record<string, unknown> = {
      createdAt: { $gt: scanFromDate },
      isClosed: { $ne: true },
    };

    // Filter by job preferences if available
    if (user.jobPreferences) {
      if (user.jobPreferences.preferredLocation) {
        jobQuery['location'] = {
          $regex: user.jobPreferences.preferredLocation,
          $options: 'i',
        };
      }
      if (user.jobPreferences.jobType) {
        jobQuery['type'] = user.jobPreferences.jobType;
      }
      if (user.jobPreferences.industry) {
        jobQuery['category'] = {
          $regex: user.jobPreferences.industry,
          $options: 'i',
        };
      }
    }

    // 4. Fetch matching jobs
    const recentJobs = await Job.find(jobQuery)
      .populate('company', 'companyName')
      .sort({ createdAt: -1 })
      .limit(10);

    let matchesFound = 0;

    // 5. Analyze each job
    for (const job of recentJobs) {
      try {
        const aiService = getAIService();
        const analysis = await aiService.analyzeJobSuitability(
          user as unknown as UserProfileForAI,
          job
        );

        // 6. If score >= 80, create notification
        if (analysis.score >= 80) {
          const companyObj = job.company as { companyName?: string } | undefined;
          const companyName = companyObj?.companyName ?? 'a company';

          await createNotification(
            userId,
            'MATCH',
            'New Job Match Found!',
            `You are a ${analysis.score}% match for "${job.title}" at ${companyName}. Check it out!`,
            job._id
          );
          matchesFound++;
        }
      } catch (err) {
        console.error(`Error analyzing job ${String(job._id)}:`, err);
        // Continue to next job
      }
    }

    // 7. Update user's lastScanDate
    await User.findByIdAndUpdate(userId, { lastScanDate: new Date() });

    res.status(200).json({
      message: 'Scan complete',
      matchesFound,
      jobsScanned: recentJobs.length,
      newJobsChecked: recentJobs.length,
    });
  } catch (error) {
    console.error('AI Match Scan Error:', error);
    res.status(500).json({ message: 'Failed to scan for matches' });
  }
};

// ─── Check Candidate Suitability (Employer) ─────────────────────────────

/**
 * @desc    Check specific candidate suitability for employer
 * @route   POST /api/ai/candidate-suitability
 * @access  Private (Employer)
 */
export const checkCandidateSuitability = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { jobId, candidateId } = req.body as CandidateSuitabilityRequestBody;

    // 1. Fetch Candidate Profile
    const user = await User.findById(candidateId).select(
      'degree major skills experiences education verifiedSkills'
    );
    if (!user) {
      res.status(404).json({ message: 'Candidate not found' });
      return;
    }

    // 2. Fetch Job Details
    const job = await Job.findById(jobId).select('title description requirements qualifications skills');
    if (!job) {
      res.status(404).json({ message: 'Job not found' });
      return;
    }

    // 3. Call AI Service
    const aiService = getAIService();
    const result = await aiService.analyzeJobSuitability(
      user as unknown as UserProfileForAI,
      job
    );

    res.status(200).json(result);
  } catch (error) {
    console.error('AI Candidate Check Error:', error);
    res.status(500).json({ message: 'Failed to analyze candidate' });
  }
};

// ─── Submit Feature Feedback ──────────────────────────────────────────────

/**
 * @desc    Submit feedback for system features
 * @route   POST /api/ai/feedback
 * @access  Private
 */
export const submitFeatureFeedback = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user._id;
    const { rating, comments, improvements, featureName } = req.body;

    if (!featureName) {
      res.status(400).json({ message: 'featureName is required' });
      return;
    }

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    if (user.feedbackProvidedFeatures && user.feedbackProvidedFeatures.includes(featureName)) {
      res.status(400).json({ message: 'Feedback already provided for this feature' });
      return;
    }

    const feedback = new FeatureFeedback({
      user: userId,
      rating,
      comments,
      improvements,
      featureName
    });

    await feedback.save();

    if (!user.feedbackProvidedFeatures) {
      user.feedbackProvidedFeatures = [];
    }
    user.feedbackProvidedFeatures.push(featureName);
    await user.save();

    res.status(201).json({ message: 'Feedback submitted successfully', feedback });
  } catch (error) {
    console.error('Submit Feature Feedback Error:', error);
    res.status(500).json({ message: 'Failed to submit feedback' });
  }
};

