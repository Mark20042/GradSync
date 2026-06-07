import { getOllamaService } from './ai/ollama.service.js';
import { getGeminiService } from './ai/gemini.service.js';
import Assessment from '../models/Assessment.model.js';
import InterviewDraft from '../models/InterviewDraft.model.js';
import User from '../models/User.model.js';
import { env } from '../config/environment.js';

const getModel = () => {
  return getGeminiService().generationModel;
};

const isGemini = () => {
  return true;
};

// ─── Global Rate-Limited Queue ──────────────────────────────────────────────
// Ensures only ONE AI call runs at a time, with configurable delay between calls.
// This prevents concurrent requests from blowing through Gemini's free-tier RPM/RPD limits.
class AIQueue {
  private queue: (() => Promise<void>)[] = [];
  private running = false;
  private delayMs: number;

  constructor(delayMs = 15000) {
    this.delayMs = delayMs; // 15s default = ~4 RPM, safely under 5 RPM limit
  }

  enqueue<T>(fn: () => Promise<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const result = await fn();
          resolve(result);
        } catch (err) {
          reject(err);
        }
      });
      this.processQueue();
    });
  }

  private async processQueue() {
    if (this.running) return;
    this.running = true;

    while (this.queue.length > 0) {
      const task = this.queue.shift()!;
      try {
        await task();
      } catch (_) { /* errors handled by individual promises */ }
      // Wait between requests to respect rate limits
      if (this.queue.length > 0) {
        await this.sleep(this.delayMs);
      }
    }

    this.running = false;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Use 5s delay for Gemini/Gemma free tier (15 RPM for Gemma), 1s for Ollama (local, no limits)
const aiQueue = new AIQueue(5000);

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// ─── JSON Repair Utilities ──────────────────────────────────────────────────
const repairJson = (raw: string): string => {
  let s = raw;
  s = s.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]+/g, '');
  s = s.replace(/,\s*([\]}])/g, '$1');
  s = s.replace(/\}\s*\{/g, '},{');
  return s;
};

const safeParse = (content: string): any => {
  // Strip markdown code blocks if present (```json ... ``` or ``` ... ```)
  let cleaned = content.replace(/```(?:json)?\s*/gi, '').replace(/```/g, '').trim();

  // Log first 500 chars for debugging
  console.log(`[safeParse] Raw response preview (${cleaned.length} chars): ${cleaned.substring(0, 500)}...`);

  // Try to find JSON object
  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');

  // Also check for bare arrays
  const firstBracket = cleaned.indexOf('[');
  const lastBracket = cleaned.lastIndexOf(']');

  // Attempt 1: Parse as JSON object { "questions": [...] }
  if (firstBrace !== -1 && lastBrace !== -1) {
    let jsonStr = cleaned.substring(firstBrace, lastBrace + 1);

    try { return JSON.parse(jsonStr); } catch (_) { /* fall through */ }
    try { return JSON.parse(repairJson(jsonStr)); } catch (_) { /* fall through */ }
  }

  // Attempt 2: Parse as bare JSON array [ { ... }, { ... } ]
  if (firstBracket !== -1 && lastBracket !== -1) {
    let arrStr = cleaned.substring(firstBracket, lastBracket + 1);

    try {
      const arr = JSON.parse(arrStr);
      if (Array.isArray(arr) && arr.length > 0) return { questions: arr };
    } catch (_) { /* fall through */ }

    try {
      const arr = JSON.parse(repairJson(arrStr));
      if (Array.isArray(arr) && arr.length > 0) return { questions: arr };
    } catch (_) { /* fall through */ }
  }

  // Attempt 3: If parsed but key isn't "questions", find any array value
  if (firstBrace !== -1 && lastBrace !== -1) {
    let jsonStr = cleaned.substring(firstBrace, lastBrace + 1);
    try {
      const obj = JSON.parse(repairJson(jsonStr));
      // Check all keys for an array of objects with questionText
      for (const key of Object.keys(obj)) {
        if (Array.isArray(obj[key]) && obj[key].length > 0 && obj[key][0].questionText) {
          return { questions: obj[key] };
        }
      }
    } catch (_) { /* fall through */ }
  }

  // Attempt 4: Regex extraction of individual question objects (last resort)
  try {
    const questionRegex = /\{[^{}]*"questionText"\s*:\s*"[^"]*"[^{}]*\}/g;
    const matches = cleaned.match(questionRegex);
    if (matches && matches.length > 0) {
      const questions = matches.map(m => {
        try { return JSON.parse(m); } catch (_) { return null; }
      }).filter(Boolean);
      if (questions.length > 0) {
        console.log(`[safeParse] Regex fallback recovered ${questions.length} questions`);
        return { questions };
      }
    }
  } catch (_) { /* fall through */ }

  console.log(`[safeParse] All parse attempts failed. Full response:\n${cleaned.substring(0, 2000)}`);
  return null;
};

// ─── Rate-limited AI Call ────────────────────────────────────────────────────
// Wraps a single AI model.invoke() with rate limiting and 429 retry logic.
const rateLimitedInvoke = async (model: any, prompt: string, retries = 3): Promise<string> => {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const response = await model.invoke(prompt);
      let content = response.content;

      // Handle Gemma "thinking" model response format:
      // content = [{"type":"thinking","thinking":"..."}, {"type":"text","text":"...actual JSON..."}]
      if (Array.isArray(content)) {
        // Find the "text" block and extract its text value
        const textBlock = content.find((block: any) => block.type === 'text' && block.text);
        if (textBlock) {
          console.log(`[rateLimitedInvoke] Extracted text block from thinking model response`);
          return textBlock.text;
        }
        // If no text block found, try to stringify the whole thing
        return JSON.stringify(content);
      }

      return typeof content === 'string' ? content : JSON.stringify(content);
    } catch (error: any) {
      const errorMsg = error?.message || '';

      // Handle 429 rate limit errors — parse retry delay from Google's error
      if (errorMsg.includes('429') || errorMsg.includes('quota') || errorMsg.includes('Too Many Requests')) {
        const retryMatch = errorMsg.match(/retry\s+in\s+([\d.]+)s/i);
        const waitSeconds = retryMatch ? Math.ceil(parseFloat(retryMatch[1])) + 5 : 60;
        console.log(`[Rate Limit] Waiting ${waitSeconds}s before retry (attempt ${attempt + 1}/${retries})...`);
        await sleep(waitSeconds * 1000);
        continue;
      }

      // Non-rate-limit error — throw immediately
      throw error;
    }
  }
  throw new Error('Max retries exceeded for rate-limited invoke');
};

// ─── Assessment Generation ───────────────────────────────────────────────────
export const generateAssessment = async (skill: string, candidateId: string, awaitChunks = false) => {
  const model = getModel();
  const useQueue = isGemini();

  // Create the assessment immediately in 'generating' status
  const assessment = new Assessment({
    candidateId,
    skill: skill.toLowerCase(),
    title: `${skill} Comprehensive Assessment`,
    difficulty: 'Entry',
    timeLimit: 90,
    passingScore: 75,
    maxTabSwitches: 3,
    maxCopyPastes: 3,
    maxWindowBlurs: 3,
    maxRightClicks: 3,
    maxDevTools: 1,
    questions: [],
    status: 'generating',
  });
  await assessment.save();

  const generateChunks = async () => {
    const categories = ['Technical', 'Behavioral', 'Communication', 'Logical', 'General'];

    for (const category of categories) {
      // Detect if skill is programming/IT related for code snippet inclusion
      const techKeywords = ['javascript', 'typescript', 'python', 'java', 'c#', 'c++', 'php', 'ruby', 'go', 'rust', 'swift', 'kotlin', 'react', 'angular', 'vue', 'node', 'express', 'django', 'flask', 'spring', 'sql', 'mysql', 'postgresql', 'mongodb', 'redis', 'docker', 'kubernetes', 'aws', 'azure', 'gcp', 'html', 'css', 'sass', 'tailwind', 'git', 'linux', 'bash', 'powershell', 'api', 'rest', 'graphql', 'webpack', 'vite', 'next', 'nuxt', 'laravel', 'rails', '.net', 'flutter', 'dart', 'r programming', 'matlab', 'scala', 'perl', 'assembly', 'objective-c', 'programming', 'coding', 'software', 'web development', 'mobile development', 'frontend', 'backend', 'fullstack', 'devops', 'data structure', 'algorithm', 'machine learning', 'ai', 'deep learning', 'cybersecurity', 'networking'];
      const isProgramming = techKeywords.some(kw => skill.toLowerCase().includes(kw));

      const codeSnippetInstruction = isProgramming
        ? 'For technical questions, include short code snippets where relevant. Use the "codeSnippet" field for this.'
        : 'Do NOT include code snippets. Leave the "codeSnippet" field as an empty string for all questions. This skill is not programming-related.';

      // 1 call per category, 10 questions each = 50 questions total per skill
      const prompt = `You are an expert technical assessor. Generate exactly 10 assessment questions for the skill "${skill}" under the "${category}" category.
Use a mix of "multiple-choice", "true-false", and "identification" formats.
${codeSnippetInstruction}

Return ONLY a valid JSON object. No markdown, no explanation, no extra text.
Do NOT use comments inside the JSON. Escape special characters in strings.

{
  "questions": [
    {
      "type": "multiple-choice",
      "questionText": "What is ...?",
      "codeSnippet": "",
      "options": ["A", "B", "C", "D"],
      "correctAnswer": "A",
      "explanation": "Because ...",
      "category": "${category}"
    }
  ]
}`;

      let success = false;
      let retries = 2;

      while (!success && retries >= 0) {
        try {
          console.log(`[${skill}] Generating ${category} (attempt ${3 - retries}/3)...`);

          let content: string;
          if (useQueue) {
            // Queue ensures sequential execution with delays for Gemini
            content = await aiQueue.enqueue(() => rateLimitedInvoke(model, prompt));
          } else {
            // Ollama is local — no rate limits, call directly
            content = await rateLimitedInvoke(model, prompt, 1);
          }

          const parsed = safeParse(content);

          if (parsed?.questions && Array.isArray(parsed.questions) && parsed.questions.length > 0) {
            assessment.questions.push(...parsed.questions);
            await assessment.save();
            console.log(`[${skill}] ✓ ${category}: ${parsed.questions.length} questions saved (total: ${assessment.questions.length})`);
            success = true;
          } else {
            throw new Error('Parsed result had no valid questions array');
          }
        } catch (error: any) {
          console.error(`[${skill}] ✗ ${category} failed:`, error?.message || error);
          retries--;
          if (retries < 0) {
            console.log(`[${skill}] Giving up on ${category} after 3 attempts.`);
          }
        }
      }
    }

    assessment.status = 'approved';
    await assessment.save();
    console.log(`[${skill}] ═══ Assessment complete. Total questions: ${assessment.questions.length} ═══`);
  };

  // If awaitChunks is true, wait for completion (used by batch generation)
  if (awaitChunks) {
    await generateChunks();
  } else {
    // Fire and forget — runs in background
    generateChunks().catch(err => console.error("Background chunk generation failed:", err));
  }
  return assessment;
};

// ─── Batch Assessment Generation (Sequential) ───────────────────────────────
// Processes all skills one at a time: skill 1 finishes completely, then skill 2, etc.
export const generateAllAssessments = async (skills: string[], candidateId: string) => {
  const results: any[] = [];

  console.log(`[Batch] Starting sequential generation for ${skills.length} skills: ${skills.join(', ')}`);

  for (const skill of skills) {
    if (!skill) continue;
    console.log(`[Batch] ──── Processing skill: ${skill} ────`);
    try {
      // awaitChunks = true so each skill fully completes before moving to the next
      const assessment = await generateAssessment(skill, candidateId, true);
      results.push(assessment);
    } catch (err) {
      console.error(`[Batch] Failed to generate for ${skill}:`, err);
    }
  }

  console.log(`[Batch] ═══ All done. Generated ${results.length}/${skills.length} assessments ═══`);
  return results;
};

// ─── Interview Generation ────────────────────────────────────────────────────
export const generateInterviewDraft = async (candidateId: string) => {
  const model = getModel();
  const useQueue = isGemini();

  const user = await User.findById(candidateId);
  if (!user) throw new Error("Candidate not found.");

  const desiredJob = user.jobPreferences?.desiredJobTitle || '';

  const prompt = `You are an expert HR and Technical Interviewer. Create a tailored interview consisting of exactly 20 questions for the following candidate based on their professional background.

Candidate Background:
- Skills: ${user.skills?.join(', ') || 'None specified'}
- Degree: ${user.degree || 'None specified'}
- Major: ${user.major || 'None specified'}
- Desired Job Title: ${desiredJob || 'Not specified'}
- Experiences/Internships/Projects: ${JSON.stringify(user.experiences || [])}
- Job Preferences: ${JSON.stringify(user.jobPreferences || {})}

${desiredJob ? `IMPORTANT: Focus the majority of questions on the desired job title "${desiredJob}". Tailor technical and behavioral questions specifically for this role.` : ''}

Categorize these interview questions into the following categories: General, Communication, Technical, and Behavioral. Provide an ideal expected answer for each.

Return ONLY a valid JSON object. No markdown, no explanation, no extra text.
{
  "questions": [
    {
      "questionText": "Question text here",
      "idealAnswer": "Expected ideal answer here",
      "category": "Technical"
    }
  ]
}`;

  // 1. Create draft with "generating" status
  let interviewDraft = new InterviewDraft({
    candidateId,
    questions: [],
    status: 'generating',
  });
  await interviewDraft.save();

  const maxRetries = 3;
  let attempts = 0;
  let parsed = null;

  while (attempts < maxRetries) {
    attempts++;
    try {
      console.log(`[Interview] Generating draft for candidate ${candidateId} (Attempt ${attempts}/${maxRetries})...`);

      let content: string;
      if (useQueue) {
        content = await aiQueue.enqueue(() => rateLimitedInvoke(model, prompt));
      } else {
        content = await rateLimitedInvoke(model, prompt, 1);
      }

      parsed = safeParse(content);

      if (!parsed || !parsed.questions || !Array.isArray(parsed.questions) || parsed.questions.length === 0) {
        throw new Error("Failed to parse valid JSON from AI response.");
      }

      // Success
      break;
    } catch (error) {
      console.error(`[Interview] ✗ Attempt ${attempts} failed:`, error instanceof Error ? error.message : String(error));
      if (attempts === maxRetries) {
        // If max retries reached, delete the generating draft and throw error
        await InterviewDraft.findByIdAndDelete(interviewDraft._id);
        throw new Error('Failed to generate interview draft after 3 attempts.');
      }
      await sleep(2000 * attempts); // Backoff before retry
    }
  }

  // 2. Update draft with generated questions and status "approved"
  interviewDraft.questions = parsed.questions;
  interviewDraft.status = 'approved';
  await interviewDraft.save();

  console.log(`[Interview] ✓ Generated ${parsed.questions.length} interview questions for candidate ${candidateId}`);
  return interviewDraft;
};

// ─── Global User Queue ──────────────────────────────────────────────────────
// Ensures auto-generation for multiple users is processed ONE user at a time.
// When many users sign up simultaneously, they are queued and handled sequentially.
class UserQueue {
  private queue: (() => Promise<void>)[] = [];
  private running = false;

  enqueue(fn: () => Promise<void>) {
    this.queue.push(fn);
    this.processQueue();
  }

  private async processQueue() {
    if (this.running) return;
    this.running = true;

    while (this.queue.length > 0) {
      const task = this.queue.shift()!;
      try {
        await task();
      } catch (err) {
        console.error('[UserQueue] Task error:', err);
      }
    }

    this.running = false;
  }
}

const userQueue = new UserQueue();

// ─── Auto-Generation on Signup ───────────────────────────────────────────────
// Called when a user completes profile setup. Processes:
//   1. Interview questions FIRST (based on desired job title)
//   2. Then assessments for each skill (sequentially)
// All queued so multiple signups don't overwhelm the API.
export const autoGenerateForUser = (candidateId: string, skills: string[]) => {
  userQueue.enqueue(async () => {
    console.log(`\n[AutoGen] ╔═══ Starting auto-generation for user ${candidateId} ═══╗`);

    // Step 1: Generate interview questions FIRST
    try {
      console.log(`[AutoGen] Step 1/2: Generating interview questions...`);
      await generateInterviewDraft(candidateId);
      console.log(`[AutoGen] ✓ Interview questions generated successfully`);
    } catch (err) {
      console.error(`[AutoGen] ✗ Interview generation failed:`, err);
    }

    // Step 2: Generate assessments for each skill sequentially
    if (skills.length > 0) {
      console.log(`[AutoGen] Step 2/2: Generating assessments for ${skills.length} skills...`);
      await generateAllAssessments(skills, candidateId);
    }

    console.log(`[AutoGen] ╚═══ Auto-generation complete for user ${candidateId} ═══╝\n`);
  });
};

// ─── Auto-Generate Missing Assessments ──────────────────────────────────────
// Enqueues ONLY the missing skills for a user, usually triggered on profile edit
export const autoGenerateMissingForUser = (candidateId: string, missingSkills: string[]) => {
  if (missingSkills.length === 0) return;

  userQueue.enqueue(async () => {
    console.log(`\n[AutoGen] ╔═══ Starting missing assessment generation for user ${candidateId} ═══╗`);
    console.log(`[AutoGen] Generating for missing skills: ${missingSkills.join(', ')}`);

    try {
      await generateAllAssessments(missingSkills, candidateId);
      console.log(`[AutoGen] ✓ Missing assessments generated successfully`);
    } catch (err) {
      console.error(`[AutoGen] ✗ Missing assessment generation failed:`, err);
    }

    console.log(`[AutoGen] ╚═══ Missing assessment generation complete for user ${candidateId} ═══╝\n`);
  });
};

