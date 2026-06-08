import SystemMetrics from "../../models/SystemMetrics.model.js";

class AILimitService {
  private static instance: AILimitService;
  private activeRequests: number = 0;
  private readonly MAX_CONCURRENT_REQUESTS = 12;

  private constructor() {}

  public static getInstance(): AILimitService {
    if (!AILimitService.instance) {
      AILimitService.instance = new AILimitService();
    }
    return AILimitService.instance;
  }

  /**
   * Acquire a slot for AI execution.
   * If slots are full, it will wait.
   */
  public async acquireSlot(): Promise<void> {
    while (this.activeRequests >= this.MAX_CONCURRENT_REQUESTS) {
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
    this.activeRequests++;
  }

  /**
   * Release a slot after AI execution.
   */
  public releaseSlot(): void {
    if (this.activeRequests > 0) {
      this.activeRequests--;
    }
  }

  /**
   * Record a request for Gemini (Evaluator)
   */
  public async recordGeminiRequest(): Promise<void> {
    await this.incrementMetric("gemini");
  }

  /**
   * Record a request for Gemma (Generator)
   */
  public async recordGemmaRequest(): Promise<void> {
    await this.incrementMetric("gemma");
  }

  private async incrementMetric(type: "gemini" | "gemma"): Promise<void> {
    try {
      const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
      const updateField = type === "gemini" ? "geminiDailyRequests" : "gemmaDailyRequests";

      // Enforce Limits
      const metrics = await SystemMetrics.findOne({ date: today });
      if (metrics) {
        if (type === "gemini" && metrics.geminiDailyRequests >= 500) {
          throw new Error("Gemini (Evaluator) daily limit reached. Try again tomorrow.");
        }
        if (type === "gemma" && metrics.gemmaDailyRequests >= 1500) {
          throw new Error("Gemma (Generator) daily limit reached. Try again tomorrow.");
        }
      }

      await SystemMetrics.findOneAndUpdate(
        { date: today },
        { $inc: { [updateField]: 1 } },
        { upsert: true, new: true }
      );
    } catch (error: any) {
      // Re-throw limit errors
      if (error.message.includes("limit reached")) {
        throw error;
      }
      console.error("Error updating AI metrics:", error);
    }
  }
}

export const getAILimitService = () => AILimitService.getInstance();
