const Job = require("../models/Job");
const User = require("../models/User");
const { ChatOllama } = require("@langchain/ollama");
const { HumanMessage, SystemMessage } = require("@langchain/core/messages");

// Initialize Llama 3 model
const chatModel = new ChatOllama({
    baseUrl: "http://localhost:11434", // Default Ollama URL
    model: "qwen2.5:3b", // Balanced speed and performance
    temperature: 0.7,
});

exports.askMentor = async (req, res) => {
    try {
        const { referenceJobId, question } = req.body;
        const userId = req.user._id;

        // 1. Fetch Context
        const user = await User.findById(userId).select("skills experiences education degree major");
        let jobContext = "";

        if (referenceJobId) {
            const job = await Job.findById(referenceJobId).select("title description requirements skills company");
            if (job) {
                jobContext = `
        CONTEXT: The user is asking about a specific job:
        Title: ${job.title}
        Company: ${job.company?.companyName || "Unknown"}
        Description: ${job.description}
        Requirements: ${job.requirements}
        Required Skills: ${job.skills?.join(", ")}
        `;
            }
        }

        const userContext = `
    USER PROFILE:
    Degree: ${user.degree} in ${user.major}
    Skills: ${user.skills?.join(", ")}
    Experience: ${user.experiences?.map(e => `${e.title} at ${e.company}`).join(", ")}
    `;

        // 2. Construct Prompt
        const systemPrompt = `You are an expert AI Career Mentor. Your goal is to provide helpful, encouraging, and actionable career advice to a job seeker.
    
    ${userContext}

    ${jobContext}

    Analyze the user's profile against the job context (if provided). 
    If the user asks about the job, explain how their skills match or what they might be missing.
    If no job is provided, give general career advice based on their profile.
    Keep responses concise, professional, and supportive.`;

        // 3. Call AI
        const messages = [
            new SystemMessage(systemPrompt),
            new HumanMessage(question),
        ];

        const response = await chatModel.invoke(messages);

        res.status(200).json({ answer: response.content });

    } catch (error) {
        console.error("AI Mentor Error:", error);
        res.status(500).json({ message: "Failed to get mentor response" });
    }
};
