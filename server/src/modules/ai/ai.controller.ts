import type { Response } from 'express';
import User from '../../shared/models/User.model.js';
import Job from '../../shared/models/Job.model.js';
import { getOllamaService } from './services/ollama.service.js';
import { createNotification } from '../../shared/utils/notification.helper.js';
import type { AuthenticatedRequest } from '../../shared/interfaces/base.interfaces.js';
import type {
  SuitabilityRequestBody,
  CandidateSuitabilityRequestBody,
  MentorRequestBody,
  UserProfileForAI,
} from './ai.interfaces.js';

const ollama = getOllamaService();

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
      'degree major skills experiences education'
    );
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    // 2. Fetch Job Details
    const job = await Job.findById(jobId).select('title description requirements');
    if (!job) {
      res.status(404).json({ message: 'Job not found' });
      return;
    }

    // 3. Call AI Service
    const result = await ollama.analyzeJobSuitability(
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
      'degree major skills experiences education'
    );

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    const result = await ollama.generateAISummary(
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
      'degree major skills experiences education jobPreferences lastScanDate'
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
        const analysis = await ollama.analyzeJobSuitability(
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
      'degree major skills experiences education'
    );
    if (!user) {
      res.status(404).json({ message: 'Candidate not found' });
      return;
    }

    // 2. Fetch Job Details
    const job = await Job.findById(jobId).select('title description requirements');
    if (!job) {
      res.status(404).json({ message: 'Job not found' });
      return;
    }

    // 3. Call AI Service
    const result = await ollama.analyzeJobSuitability(
      user as unknown as UserProfileForAI,
      job
    );

    res.status(200).json(result);
  } catch (error) {
    console.error('AI Candidate Check Error:', error);
    res.status(500).json({ message: 'Failed to analyze candidate' });
  }
};

// ─── AI Career Mentor ───────────────────────────────────────────────────

/**
 * @desc    Ask the AI Career Mentor
 * @route   POST /api/ai/mentor
 * @access  Private
 */
export const askMentor = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { referenceJobId, question } = req.body as MentorRequestBody;
    const userId = req.user._id;

    // 1. Fetch User Context
    const user = await User.findById(userId).select(
      'skills experiences education degree major'
    );

    let jobContext = '';
    if (referenceJobId) {
      const job = await Job.findById(referenceJobId).select(
        'title description requirements skills company'
      );
      if (job) {
        const companyObj = job.company as { companyName?: string } | undefined;
        jobContext = `
        CONTEXT: The user is asking about a specific job:
        Title: ${job.title}
        Company: ${companyObj?.companyName ?? 'Unknown'}
        Description: ${job.description}
        Requirements: ${job.requirements}
        Required Skills: ${job.skills?.join(', ') ?? 'N/A'}
        `;
      }
    }

    const userContext = `
    USER PROFILE:
    Degree: ${user?.degree ?? 'N/A'} in ${user?.major ?? 'N/A'}
    Skills: ${user?.skills?.join(', ') ?? 'N/A'}
    Experience: ${user?.experiences?.map((e) => `${e.title} at ${e.company}`).join(', ') ?? 'N/A'}
    `;

    // 2. Call AI Mentor
    const result = await ollama.askMentor(question, userContext, jobContext);

    res.status(200).json(result);
  } catch (error) {
    console.error('AI Mentor Error:', error);
    res.status(500).json({ message: 'Failed to get mentor response' });
  }
};
