import axiosInstance from "./axiosInstance"; // Adjust path as needed
import { API_PATH } from "./apiPath"; // Adjust path as needed

/**
 * Sends data to the backend to generate an AI summary.
 * @param {object} resumeContext - Data like skills, experiences, education, jobTitle, bio.
 * @param {string} jobTitle - The desired job title for context.
 * @returns {Promise<string>} - A promise that resolves with the generated summary string.
 */
export const generateSummaryWithAI = async (resumeContext, jobTitle) => {
  console.log("Sending data to backend for AI Summary Generation:", {
    resumeContext,
    jobTitle,
  });

  // --- Start: Make the call to YOUR backend API ---
  try {
    // Structure the data as expected by your backend endpoint
    const payload = {
      skills: resumeContext.skills || [],
      experiences: resumeContext.experiences || [], // Ensure combined experiences are passed if needed
      internships: resumeContext.internships || [], // Or pass internships separately if backend expects it
      education: resumeContext.education || [],
      jobTitle: jobTitle || resumeContext.jobPreferences?.desiredJobTitle || "",
      bio: resumeContext.summary || "", // Pass current summary/bio
      // Add other relevant fields your backend might use
    };

    const response = await axiosInstance.post(
      API_PATH.AI.GENERATE_SUMMARY,
      payload
    );

    if (response.data && response.data.summary) {
      console.log("Received AI Summary from backend:", response.data.summary);
      return response.data.summary; // Return the summary from the backend
    } else {
      console.error("Backend response missing summary:", response.data);
      throw new Error("Backend did not return a valid summary.");
    }
  } catch (error) {
    console.error(
      "Error calling backend for AI Summary:",
      error.response?.data || error.message
    );
    // Re-throw the error or a more user-friendly message
    throw new Error(
      error.response?.data?.message ||
        "Failed to connect to the AI summary service."
    );
  }
  // --- End: Make the call to YOUR backend API ---
};

// Note: The previous placeholder logic with setTimeout is removed.
// The actual AI call happens on your backend now.
