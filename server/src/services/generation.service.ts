import { getOllamaService } from './ai/ollama.service.js';
import { getGeminiService } from './ai/gemini.service.js';
import Assessment from '../models/Assessment.model.js';
import InterviewDraft from '../models/InterviewDraft.model.js';
import User from '../models/User.model.js';
import { env } from '../config/environment.js';
import { getAILimitService } from './ai/ai-limit.service.js';

const getModel = () => {
  return getGeminiService().generationModel;
};

const isGemini = () => {
  return true;
};

//  Queue for AI generation to prevent overloading the server
class AIQueue {
  private queue: (() => Promise<void>)[] = [];
  private running = false;
  private delayMs: number;

  //  delay to prevent overloading the server
  constructor(delayMs = 15000) {
    this.delayMs = delayMs;
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
      } catch (_) {}
      
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

// 5s delay for ai generation
const aiQueue = new AIQueue(5000);

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// repairs json when fetched
const repairJson = (raw: string): string => {
  let s = raw;
  s = s.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]+/g, '');
  s = s.replace(/,\s*([\]}])/g, '$1');
  s = s.replace(/\}\s*\{/g, '},{');
  return s;
};

const safeParse = (content: string): any => {
  
  let cleaned = content.replace(/```(?:json)?\s*/gi, '').replace(/```/g, '').trim();

  
  console.log(`[safeParse] Raw response preview (${cleaned.length} chars): ${cleaned.substring(0, 500)}...`);

 
  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');

 
  const firstBracket = cleaned.indexOf('[');
  const lastBracket = cleaned.lastIndexOf(']');

  
  if (firstBrace !== -1 && lastBrace !== -1) {
    let jsonStr = cleaned.substring(firstBrace, lastBrace + 1);

    try { return JSON.parse(jsonStr); } catch (_) { }
    try { return JSON.parse(repairJson(jsonStr)); } catch (_) { }
  }


  if (firstBracket !== -1 && lastBracket !== -1) {
    let arrStr = cleaned.substring(firstBracket, lastBracket + 1);

    try {
      const arr = JSON.parse(arrStr);
      if (Array.isArray(arr) && arr.length > 0) return { questions: arr };
    } catch (_) { }

    try {
      const arr = JSON.parse(repairJson(arrStr));
      if (Array.isArray(arr) && arr.length > 0) return { questions: arr };
    } catch (_) { }
  }

  // If parsed but key isn't "questions", find any array value
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
    } catch (_) { }
  }

  // Regex extraction of individual question objects (last resort)
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
  } catch (_) {}

  console.log(`[safeParse] All parse attempts failed. Full response:\n${cleaned.substring(0, 2000)}`);
  return null;
};

// rate limited invoke
const rateLimitedInvoke = async (model: any, prompt: string, retries = 3): Promise<string> => {
  for (let attempt = 0; attempt < retries; attempt++) {
    const limitService = getAILimitService();
    await limitService.acquireSlot();
    try {
      await limitService.recordGemmaRequest();
      const response = await model.invoke(prompt);
      let content = response.content;

     // handles gemma gemini thinking
      if (Array.isArray(content)) {
        
        const textBlock = content.find((block: any) => block.type === 'text' && block.text);
        if (textBlock) {
          console.log(`[rateLimitedInvoke] Extracted text block from thinking model response`);
          return textBlock.text;
        }
       
        return JSON.stringify(content);
      }

      return typeof content === 'string' ? content : JSON.stringify(content);
    } catch (error: any) {
      const errorMsg = error?.message || '';

    
      if (errorMsg.includes('429') || errorMsg.includes('quota') || errorMsg.includes('Too Many Requests')) {
        const retryMatch = errorMsg.match(/retry\s+in\s+([\d.]+)s/i);
        const waitSeconds = retryMatch ? Math.ceil(parseFloat(retryMatch[1])) + 5 : 60;
        console.log(`[Rate Limit] Waiting ${waitSeconds}s before retry (attempt ${attempt + 1}/${retries})...`);
        await sleep(waitSeconds * 1000);
        continue;
      }

    
      throw error;
    } finally {
      limitService.releaseSlot();
    }
  }
  throw new Error('Max retries exceeded for rate-limited invoke');
};

export const generateAssessment = async (skill: string, candidateId: string, awaitChunks = false) => {
  const model = getModel();
  const useQueue = isGemini();

 
  const existingAssessment = await Assessment.findOne({
    candidateId,
    skill: skill.toLowerCase()
  });

  if (existingAssessment) {
    console.log(`[${skill}] Assessment already exists for candidate ${candidateId}. Skipping generation.`);
    return existingAssessment;
  }

  // create the assessment immediately in 'generating' status
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
            
            content = await aiQueue.enqueue(() => rateLimitedInvoke(model, prompt));
          } else {
           
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

 
  if (awaitChunks) {
    await generateChunks();
  } else {
    
    generateChunks().catch(err => console.error("Background chunk generation failed:", err));
  }
  return assessment;
};

// batch assessment generation (sequential)
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

// interview generation
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
       
        await InterviewDraft.findByIdAndDelete(interviewDraft._id);
        throw new Error('Failed to generate interview draft after 3 attempts.');
      }
      await sleep(2000 * attempts); // Backoff before retry
    }
  }


  interviewDraft.questions = parsed.questions;
  interviewDraft.status = 'approved';
  await interviewDraft.save();

  console.log(`[Interview] ✓ Generated ${parsed.questions.length} interview questions for candidate ${candidateId}`);
  return interviewDraft;
};

// global user queue based on who signed up first
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

// auto generate 
export const autoGenerateForUser = (candidateId: string, skills: string[]) => {
  userQueue.enqueue(async () => {
    console.log(`\n[AutoGen] ╔═══ Starting auto-generation for user ${candidateId} ═══╗`);

    
    try {
      console.log(`[AutoGen] Step 1/2: Generating interview questions...`);
      await generateInterviewDraft(candidateId);
      console.log(`[AutoGen] ✓ Interview questions generated successfully`);
    } catch (err) {
      console.error(`[AutoGen] ✗ Interview generation failed:`, err);
    }

    
    if (skills.length > 0) {
      console.log(`[AutoGen] Step 2/2: Generating assessments for ${skills.length} skills...`);
      await generateAllAssessments(skills, candidateId);
    }

    console.log(`[AutoGen] ╚═══ Auto-generation complete for user ${candidateId} ═══╝\n`);
  });
};

// auto generate missing assessments
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

