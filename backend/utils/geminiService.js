const { GoogleGenerativeAI } = require("@google/generative-ai"); // Use require
const dotenv = require("dotenv"); // Use require

dotenv.config(); // Load environment variables

// Input validation for API Key
if (!process.env.GEMINI_API_KEY) {
  console.error(
    "FATAL ERROR: GEMINI_API_KEY is not defined in the environment variables."
  );
  // You might want to exit the process or throw a more critical error here
  // depending on your application's requirements.
  // For now, we'll throw an error to prevent proceeding without a key.
  throw new Error("Gemini API Key is missing. Please check your .env file.");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });
// Or your preferred model

const generateAISummary = async (promptText) => {
  // Define function
  if (!promptText) {
    throw new Error("Prompt text cannot be empty.");
  }

  try {
    const result = await model.generateContent(promptText);
    const response = result.response;

    // Add checks for response structure before calling text()
    if (!response) {
      console.error("Gemini API returned no response object.");
      throw new Error("AI service returned an invalid response.");
    }
    // Check if the text() method exists
    if (typeof response.text !== "function") {
      console.error(
        "Gemini API response object does not have a text method. Response:",
        response
      );
      throw new Error("AI service returned an unexpected response format.");
    }

    const summary = response.text();
    console.log("Gemini Raw Response Candidates:", response.candidates);
    // Log candidates for detailed info
    console.log("Extracted Text:", summary);
    return summary;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    // More detailed error logging
    if (error.response && error.response.promptFeedback) {
      console.error("Prompt Feedback:", error.response.promptFeedback);
      throw new Error(
        `Content generation blocked due to safety settings: ${error.response.promptFeedback.blockReason || "Unknown reason"
        }`
      );
    } else if (error.message) {
      throw new Error(
        `Failed to generate summary from AI service: ${error.message}`
      );
    } else {
      throw new Error(
        "An unknown error occurred while communicating with the AI service."
      );
    }
  }
};

const analyzeJobSuitability = async (userProfile, jobDetails) => {
  if (!userProfile || !jobDetails) {
    throw new Error("User profile and job details are required.");
  }

  const prompt = `
    Analyze the suitability of the following candidate for the job position.
    
    Candidate Profile:
    - Degree: ${userProfile.degree}
    - Major: ${userProfile.major}
    - Skills: ${userProfile.skills?.join(", ")}
    - Experience: ${JSON.stringify(userProfile.experiences)}
    
    Job Details:
    - Title: ${jobDetails.title}
    - Description: ${jobDetails.description}
    - Requirements: ${jobDetails.requirements}
    
    Provide a concise analysis (max 150 words) and a suitability score (0-100).
    Format the output as JSON: { "analysis": "...", "score": 85 }
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    // Clean up markdown code blocks if present
    const jsonStr = text.replace(/```json/g, "").replace(/```/g, "").trim();
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error("Error analyzing suitability:", error);
    throw new Error("Failed to analyze suitability.");
  }
};

module.exports = { generateAISummary, analyzeJobSuitability };
