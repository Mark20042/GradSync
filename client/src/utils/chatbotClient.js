import axios from "axios";

/**
 * Standalone client for the GradSync RAG chatbot (FastAPI).
 *
 * Deliberately NOT the shared axiosInstance: that one points at the Express
 * API, sends the auth cookie with every call, and redirects to "/" on a 401.
 * The chatbot is a different origin, needs no cookie, and must stay usable for
 * logged-out visitors on the landing page.
 */
const CHATBOT_URL = import.meta.env.VITE_CHATBOT_API_URL;

const chatbotClient = axios.create({
  baseURL: CHATBOT_URL,
  timeout: 60000, // the model fallback chain can take a while on a cold start
  withCredentials: false, // no cookies cross-origin; FastAPI uses allow_origins ["*"]
  headers: { "Content-Type": "application/json" },
});

/**
 * Translate an app role into one the chatbot understands.
 * The API accepts only "graduate" | "employer" | "guest", while the app also
 * has "jobseeker" (same feature set as a graduate) and "admin".
 */
export const toChatbotRole = (user) => {
  if (!user) return "guest";
  if (user.isAdmin) return null; // no role prefix: admins may ask about anything
  switch (user.role) {
    case "graduate":
    case "jobseeker":
      return "graduate";
    case "employer":
      return "employer";
    default:
      return "guest";
  }
};

/** Ask the chatbot a question. Returns { answer, inScope, sources, modelUsed }. */
export const askChatbot = async (message, role, { signal } = {}) => {
  if (!CHATBOT_URL) {
    throw new Error(
      "Chatbot is not configured. Set VITE_CHATBOT_API_URL in your .env file."
    );
  }

  const payload = { message: message.trim() };
  if (role) payload.role = role; // omitted for admins so the API leaves the role open

  const { data } = await chatbotClient.post("/chat", payload, { signal });

  return {
    answer: data.answer,
    inScope: data.in_scope,
    sources: data.sources ?? [],
    modelUsed: data.model_used,
  };
};

/** Turn an axios failure into something worth showing a user. */
export const describeChatbotError = (error) => {
  if (axios.isCancel(error) || error.name === "CanceledError") return null;

  const status = error.response?.status;
  if (status === 429) {
    return "The assistant has reached its daily limit. Please try again tomorrow, or contact a GradSync administrator.";
  }
  if (status === 503) {
    return "The assistant is busy right now. Please try again in a moment.";
  }
  if (status === 422) {
    return "That message could not be sent. Please keep it under 1000 characters.";
  }
  if (error.code === "ECONNABORTED") {
    return "That took too long to answer. Please try again.";
  }
  if (!error.response) {
    return "Could not reach the assistant. Please check your connection and try again.";
  }
  return "Something went wrong. Please try again, or contact a GradSync administrator.";
};

export default chatbotClient;
