const { ChatOllama } = require("@langchain/ollama");
const { PromptTemplate } = require("@langchain/core/prompts");
const dotenv = require("dotenv");

dotenv.config();

// Initialize the model
// Using llama3.1:8b for best quality reasoning and accuracy
const model = new ChatOllama({
  model: "llama3.1:8b", // Best balance of quality and speed
  temperature: 0.5, // Low temperature for consistent JSON output
  baseUrl: "http://127.0.0.1:11434", // Default Ollama URL
});

const analyzeJobSuitability = async (userProfile, jobDetails) => {
  if (!userProfile || !jobDetails) {
    throw new Error("User profile and job details are required.");
  }

  const template = `
    You are an extremely strict HR AI evaluator. Analyze the candidate's suitability for this job position.

    Candidate Profile:
    - Degree: {degree}
    - Major: {major}
    - Skills: {skills}
    - Experience: {experiences}

    Job Details:
    - Title: {jobTitle}
    - Description: {jobDescription}
    - Requirements: {jobRequirements}

    VERY STRICT SCORING RULES (follow exactly):
    
    Score 85-100 (Excellent Match):
    - Candidate has 90%+ of required skills listed in job requirements
    - Degree and major directly align with the job field
    - Has 2+ years relevant experience in similar role
    - Only give this score if candidate is near-perfect fit
    
    Score 70-84 (Good Match):
    - Candidate has 70-89% of required skills
    - Degree is related but not perfectly aligned
    - Has some relevant experience (internship or 1 year)
    
    Score 50-69 (Moderate Match):
    - Candidate has 40-69% of required skills
    - Degree is somewhat related to the field
    - Limited or no direct experience
    
    Score 25-49 (Weak Match):
    - Candidate has less than 40% of required skills
    - Degree is unrelated to job field
    - No relevant experience
    
    Score 0-24 (Poor Match):
    - Candidate lacks most essential qualifications
    - Complete mismatch between profile and job

    IMPORTANT: Be harsh. Most fresh graduates without exact skill matches should score 40-65.
    Do NOT inflate scores. An average candidate should score around 50.

    Return ONLY a valid JSON object:
    {{
      "analysis": "Your 2-3 sentence analysis here...",
      "score": 52,
      "matchLevel": "Moderate",
      "recommendations": ["Specific skill to learn", "Course to take", "Experience to gain"]
    }}
    
    Do not include markdown, code blocks, or extra text. Just raw JSON.
  `;

  const prompt = new PromptTemplate({
    template: template,
    inputVariables: [
      "degree",
      "major",
      "skills",
      "experiences",
      "jobTitle",
      "jobDescription",
      "jobRequirements",
    ],
  });

  try {
    const input = await prompt.format({
      degree: userProfile.degree || "N/A",
      major: userProfile.major || "N/A",
      skills: userProfile.skills?.join(", ") || "N/A",
      experiences: JSON.stringify(userProfile.experiences || []),
      jobTitle: jobDetails.title,
      jobDescription: jobDetails.description,
      jobRequirements: jobDetails.requirements,
    });

    console.log("Sending prompt to Local AI (Ollama)...");
    const response = await model.invoke(input);
    console.log("Ollama Response:", response);

    // The response from ChatOllama is usually a BaseMessage object, we need the content
    const content = response.content || response;

    // Parse JSON from response
    const firstBrace = content.indexOf("{");
    const lastBrace = content.lastIndexOf("}");

    if (firstBrace !== -1 && lastBrace !== -1) {
      const jsonStr = content.substring(firstBrace, lastBrace + 1);
      return JSON.parse(jsonStr);
    } else {
      throw new Error("No JSON object found in response");
    }
  } catch (error) {
    console.error("Error analyzing suitability:", error);
    throw new Error(
      "Failed to analyze suitability. Ensure Ollama is running and you have pulled the model (ollama pull qwen2.5:3b)."
    );
  }
};

const generateAISummary = async (userProfile) => {
  if (!userProfile) {
    throw new Error("User profile is required.");
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
    template: template,
    inputVariables: ["degree", "major", "skills", "experiences", "education"],
  });

  try {
    const input = await prompt.format({
      degree: userProfile.degree || "N/A",
      major: userProfile.major || "N/A",
      skills: userProfile.skills?.join(", ") || "N/A",
      experiences: JSON.stringify(userProfile.experiences || []),
      education: JSON.stringify(userProfile.education || []),
    });

    console.log("Sending summary prompt to Local AI (Ollama)...");
    const response = await model.invoke(input);

    // The response from ChatOllama is usually a BaseMessage object, we need the content
    const content = response.content || response;

    // Clean up any potential extra text (though prompt says not to)
    return { summary: content.trim() };
  } catch (error) {
    console.error("Error generating summary:", error);
    throw new Error("Failed to generate summary.");
  }
};

module.exports = { analyzeJobSuitability, generateAISummary };
