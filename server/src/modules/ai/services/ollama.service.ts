import { ChatOllama } from '@langchain/ollama';
import { PromptTemplate } from '@langchain/core/prompts';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { env } from '../../../shared/config/environment.js';
import type {
  UserProfileForAI,
  JobDetailsForAI,
  SuitabilityResult,
  SummaryResult,
  InterviewEvalResult,
  FullInterviewEvalResult,
  MentorResult,
} from '../ai.interfaces.js';

/**
 * Ollama AI Service (Local LLM via LangChain).
 *
 * Provides AI-powered features using a locally-hosted Ollama model.
 * This is the primary AI engine used by the AI controller.
 */
export class OllamaService {
  private model: ChatOllama;
  private mentorModel: ChatOllama;

  constructor() {
    // Primary model for structured analysis tasks
    this.model = new ChatOllama({
      model: env.OLLAMA_MODEL,
      temperature: 0.2,
      baseUrl: env.OLLAMA_BASE_URL,
    });

    // Mentor model — slightly creative for conversational tone
    this.mentorModel = new ChatOllama({
      baseUrl: env.OLLAMA_BASE_URL,
      model: 'qwen2.5:7b', // Lighter model for faster mentor responses
      temperature: 0.7,
    });
  }

  // ─── Job Suitability Analysis ──────────────────────────────────────────

  async analyzeJobSuitability(
    userProfile: UserProfileForAI,
    jobDetails: JobDetailsForAI
  ): Promise<SuitabilityResult> {
    if (!userProfile || !jobDetails) {
      throw new Error('User profile and job details are required.');
    }

    const template = `
    You are an extremely strict, objective HR AI evaluator. Your task is to calculate a precise suitability score for a candidate.

    Candidate Profile:
    - Degree: {degree}
    - Major: {major}
    - Skills: {skills}
    - Experience: {experiences}

    Job Details:
    - Title: {jobTitle}
    - Description: {jobDescription}
    - Requirements: {jobRequirements}

    CRITICAL INSTRUCTION: You MUST calculate the score using this EXACT objective rubric (Max 100 points):
    
    1. Skills Match (Max 40 points): 
       - Compare Candidate Skills to Job Requirements. 
       - Calculate the exact ratio. (e.g., matching 2 out of 5 required skills = 16 points).
       - Subtract points if core required skills are missing.
       
    2. Experience Match (Max 30 points): 
       - 0 points: No relevant experience.
       - 15 points: Internship or academic project experience only.
       - 30 points: Meets or exceeds the exact years of professional experience requested.
       
    3. Education Match (Max 30 points):
       - 0 points: Degree/Major is completely unrelated to the job field.
       - 15 points: Degree is somewhat related (e.g., Math degree for Software job).
       - 30 points: Degree/Major exactly matches the job's core field (e.g., CS for Software job).

    Calculate the sum of these 3 categories. This is the FINAL SCORE. DO NOT inflate scores. Fresh graduates with no experience will naturally cap at around 70 points maximum.

    Match Levels based on final score:
    - Score 85-100: Excellent
    - Score 70-84: Good
    - Score 50-69: Moderate
    - Score 25-49: Weak
    - Score 0-24: Poor

    Return ONLY a valid JSON object with NO markdown formatting, asterisks, or extra text. Format MUST precisely match this structure but FILL IN your own calculated values:
    {{
      "analysis": "A VERY SHORT 1-2 sentence summary explaining the fit based on skills, education, and experience. CRITICAL: DO NOT mention math or point systems.",
      "score": <Calculate the exact sum of the 3 point categories as an integer>,
      "matchLevel": "<Insert the calculated match level>",
      "recommendations": ["A specific required skill to learn", "An actionable project idea building relevant experience"]
    }}
    
    Do not include markdown, code blocks, or extra text. Just raw JSON.
  `;

    const prompt = new PromptTemplate({
      template,
      inputVariables: [
        'degree',
        'major',
        'skills',
        'experiences',
        'jobTitle',
        'jobDescription',
        'jobRequirements',
      ],
    });

    try {
      const input = await prompt.format({
        degree: userProfile.degree ?? 'N/A',
        major: userProfile.major ?? 'N/A',
        skills: userProfile.skills?.join(', ') ?? 'N/A',
        experiences: JSON.stringify(userProfile.experiences ?? []),
        jobTitle: jobDetails.title,
        jobDescription: jobDetails.description,
        jobRequirements: jobDetails.requirements,
      });

      console.log('📡 Sending prompt to Local AI (Ollama)...');
      const response = await this.model.invoke(input);

      const content =
        typeof response.content === 'string'
          ? response.content
          : JSON.stringify(response.content);

      // Parse JSON from response
      const firstBrace = content.indexOf('{');
      const lastBrace = content.lastIndexOf('}');

      if (firstBrace !== -1 && lastBrace !== -1) {
        const jsonStr = content.substring(firstBrace, lastBrace + 1);
        return JSON.parse(jsonStr) as SuitabilityResult;
      } else {
        throw new Error('No JSON object found in response');
      }
    } catch (error) {
      console.error('Error analyzing suitability:', error);
      throw new Error(
        'Failed to analyze suitability. Ensure Ollama is running and you have pulled the model.'
      );
    }
  }

  // ─── AI Summary Generation ────────────────────────────────────────────

  async generateAISummary(userProfile: UserProfileForAI): Promise<SummaryResult> {
    if (!userProfile) {
      throw new Error('User profile is required.');
    }

    const template = `
    You are an expert professional resume writer. Write a compelling professional summary (bio) for a job seeker based on their profile.

    Candidate Profile:
    - Degree: {degree}
    - Major: {major}
    - Skills: {skills}
    - Experience: {experiences}
    - Education: {education}

    Write a professional, engaging, and concise summary (max 100 words) written in the first person ("I am..."). 
    Highlight their key strengths, experience, and career goals based on the provided data.
    Do not include any introductory text like "Here is a summary...". Just the summary itself.
  `;

    const prompt = new PromptTemplate({
      template,
      inputVariables: ['degree', 'major', 'skills', 'experiences', 'education'],
    });

    try {
      const input = await prompt.format({
        degree: userProfile.degree ?? 'N/A',
        major: userProfile.major ?? 'N/A',
        skills: userProfile.skills?.join(', ') ?? 'N/A',
        experiences: JSON.stringify(userProfile.experiences ?? []),
        education: JSON.stringify(userProfile.education ?? []),
      });

      console.log('📡 Sending summary prompt to Local AI (Ollama)...');
      const response = await this.model.invoke(input);

      const content =
        typeof response.content === 'string'
          ? response.content
          : JSON.stringify(response.content);

      return { summary: content.trim() };
    } catch (error) {
      console.error('Error generating summary:', error);
      throw new Error('Failed to generate summary.');
    }
  }

  // ─── Interview Answer Evaluation ──────────────────────────────────────

  async evaluateInterviewAnswer(
    questionText: string,
    idealAnswer: string,
    candidateAnswer: string
  ): Promise<InterviewEvalResult> {
    if (!questionText || !candidateAnswer) {
      throw new Error('Question text and candidate answer are required.');
    }

    const template = `
    You are a strict but fair professional interview evaluator. You must evaluate a candidate's spoken answer against a reference (ideal) answer.

    INTERVIEW QUESTION:
    "{questionText}"

    REFERENCE ANSWER (ideal response provided by the hiring team):
    "{idealAnswer}"

    CANDIDATE'S ANSWER (transcribed from speech):
    "{candidateAnswer}"

    EVALUATION CRITERIA (score each 0-25, total = sum):
    1. RELEVANCE & ACCURACY (0-25): Does the answer address the question? Are the facts/concepts correct compared to the reference?
    2. KEY CONCEPTS COVERAGE (0-25): How many key points from the reference answer did the candidate cover? 
    3. DEPTH & DETAIL (0-25): Did the candidate provide sufficient explanation, examples, or elaboration?
    4. COMMUNICATION CLARITY (0-25): Was the response well-structured, coherent, and professionally articulated?

    STRICT SCORING RULES:
    - Score 85-100: Covers 90%+ of reference answer key points with additional insights. Exceptional communication.
    - Score 70-84: Covers 70-89% of key points. Good structure and communication.
    - Score 50-69: Covers 40-69% of key points. Adequate but lacks depth.
    - Score 25-49: Covers less than 40%. Vague, off-topic, or missing critical concepts.
    - Score 0-24: Mostly irrelevant, incoherent, or extremely brief.

    IMPORTANT: Be strict and fair. An average candidate should score around 50-60.
    If the candidate's answer is blank or just filler words, score 0-10.

    Return ONLY a valid JSON object:
    {{
      "score": 55,
      "feedback": "Your 2-3 sentence constructive feedback here. Mention what was done well and what was missed compared to the ideal answer."
    }}
    
    Do not include markdown, code blocks, or extra text. Just raw JSON.
  `;

    const prompt = new PromptTemplate({
      template,
      inputVariables: ['questionText', 'idealAnswer', 'candidateAnswer'],
    });

    try {
      const input = await prompt.format({
        questionText,
        idealAnswer:
          idealAnswer ||
          'No reference answer provided. Evaluate based on general interview best practices.',
        candidateAnswer,
      });

      console.log('📡 Sending interview evaluation prompt to Ollama...');
      const response = await this.model.invoke(input);

      const content =
        typeof response.content === 'string'
          ? response.content
          : JSON.stringify(response.content);

      // Parse JSON from response
      const firstBrace = content.indexOf('{');
      const lastBrace = content.lastIndexOf('}');

      if (firstBrace !== -1 && lastBrace !== -1) {
        const jsonStr = content.substring(firstBrace, lastBrace + 1);
        const result = JSON.parse(jsonStr) as InterviewEvalResult;

        // Ensure score is within bounds
        result.score = Math.max(0, Math.min(100, Math.round(result.score || 0)));
        result.feedback = result.feedback || 'No feedback generated.';

        return result;
      } else {
        throw new Error('No JSON object found in Ollama response');
      }
    } catch (error) {
      console.error('Error evaluating interview answer:', error);
      throw new Error(
        'Failed to evaluate interview answer. Ensure Ollama is running.'
      );
    }
  }

  async evaluateFullInterview(
    roleName: string,
    answers: Array<{ questionId: string | null; questionText: string; idealAnswer: string; candidateAnswer: string }>
  ): Promise<FullInterviewEvalResult> {
    const interviewData = answers
      .map(
        (a, i) => `
    QUESTION ${i + 1}: ${a.questionText}
    IDEAL ANSWER: ${a.idealAnswer || 'N/A'}
    CANDIDATE ANSWER: ${a.candidateAnswer}
    `
      )
      .join('\n---\n');

    const template = `
    You are an expert HR Interview Evaluator. Evaluate this entire interview for the role of "{roleName}".
    
    INTERVIEW DATA:
    ${interviewData}

    TASK:
    1. Evaluate each individual question (score 0-100 and 1-sentence feedback).
    2. Calculate an overall average score.
    3. Identify 2 key strengths and 2 areas for improvement.
    4. Write a 1-sentence summary.

    RULES:
    - Return ONLY valid JSON.
    - Be extremely concise to save time.

    RESPONSE FORMAT:
    {{
      "overallScore": 0,
      "summary": "",
      "strengths": [],
      "areasForImprovement": [],
      "evaluations": [
        {{ "questionId": "ID_OR_NULL_MATCHING_INPUT", "score": 0, "feedback": "" }}
      ]
    }}
    `;

    try {
      console.log('📡 Sending bulk interview evaluation to Ollama...');
      const response = await this.model.invoke(template);
      const content =
        typeof response.content === 'string'
          ? response.content
          : JSON.stringify(response.content);
      const firstBrace = content.indexOf('{');
      const lastBrace = content.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace !== -1) {
        return JSON.parse(
          content.substring(firstBrace, lastBrace + 1)
        ) as FullInterviewEvalResult;
      }
      throw new Error('Invalid JSON from Ollama');
    } catch (error) {
      console.error('Bulk evaluation error:', error);
      throw error;
    }
  }

  // ─── AI Career Mentor ─────────────────────────────────────────────────

  async askMentor(
    question: string,
    userContext: string,
    jobContext: string
  ): Promise<MentorResult> {
    const systemPrompt = `You are an expert AI Career Mentor. Your goal is to provide helpful, encouraging, and actionable career advice to a job seeker.
    
    ${userContext}

    ${jobContext}

    Analyze the user's profile against the job context (if provided). 
    If the user asks about the job, explain how their skills match or what they might be missing.
    If no job is provided, give general career advice based on their profile.
    Keep responses concise, professional, and supportive.
    CRITICAL INSTRUCTION: Do NOT use any Markdown formatting in your response. Do not use asterisks (*) for bold/italics, and do not use hash symbols (#) for headers. Use plain paragraph text and standard numbered or bulleted lists (using dash - or numbers).`;

    const messages = [
      new SystemMessage(systemPrompt),
      new HumanMessage(question),
    ];

    try {
      const response = await this.mentorModel.invoke(messages);

      const content =
        typeof response.content === 'string'
          ? response.content
          : JSON.stringify(response.content);

      // Clean markdown characters just in case the AI ignores the prompt
      const cleanedAnswer = content.replace(/[*#]/g, '');

      return { answer: cleanedAnswer };
    } catch (error) {
      console.error('AI Mentor Error:', error);
      throw new Error('Failed to get mentor response');
    }
  }
}

// Singleton instance
let ollamaServiceInstance: OllamaService | null = null;

export const getOllamaService = (): OllamaService => {
  if (!ollamaServiceInstance) {
    ollamaServiceInstance = new OllamaService();
  }
  return ollamaServiceInstance;
};
