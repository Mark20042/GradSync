import type { Types } from 'mongoose';

// ─── Request DTOs ───────────────────────────────────────────────────────

/** POST /api/ai/suitability */
export interface SuitabilityRequestBody {
  jobId: string;
}

/** POST /api/ai/candidate-suitability */
export interface CandidateSuitabilityRequestBody {
  jobId: string;
  candidateId: string;
}

/** POST /api/ai/mentor */
export interface MentorRequestBody {
  referenceJobId?: string;
  question: string;
}

// ─── Service Input Types ────────────────────────────────────────────────

/** Profile data passed to AI services for analysis */
export interface UserProfileForAI {
  degree?: string;
  major?: string;
  skills?: string[];
  experiences?: Array<{
    title: string;
    company: string;
    location?: string;
    description?: string;
  }>;
  education?: Array<{
    school: string;
    degree?: string;
  }>;
}

/** Job data passed to AI services for analysis */
export interface JobDetailsForAI {
  _id?: Types.ObjectId;
  title: string;
  description: string;
  requirements: string;
  skills?: string[];
  company?: { companyName?: string } | Types.ObjectId;
}

// ─── Service Response Types ─────────────────────────────────────────────

/** Result from job suitability analysis */
export interface SuitabilityResult {
  analysis: string;
  score: number;
  matchLevel?: string;
  recommendations?: string[];
}

/** Result from AI summary generation */
export interface SummaryResult {
  summary: string;
}

/** Result from interview answer evaluation */
export interface InterviewEvalResult {
  score: number;
  feedback: string;
}

/** Result from AI mentor */
export interface MentorResult {
  answer: string;
}

/** Result from scan-matches endpoint */
export interface ScanMatchesResult {
  message: string;
  matchesFound: number;
  jobsScanned: number;
  newJobsChecked: number;
}

/** Result from bulk interview evaluation */
export interface FullInterviewEvalResult {
  overallScore: number;
  summary: string;
  strengths: string[];
  areasForImprovement: string[];
  evaluations: Array<{
    questionId: string | null;
    score: number;
    feedback: string;
  }>;
}
