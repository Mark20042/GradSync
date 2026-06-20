import express, { type Request, type Response } from "express";
import * as dotenv from "dotenv";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import morgan from "morgan";

// routes import
import authRoutes from "@/routes/auth.route.js";
import userRoutes from "@/routes/user.route.js";
import jobRoutes from "@/routes/job.route.js";
import applicationRoutes from "@/routes/application.route.js";
import savedJobsRoutes from "@/routes/saved-jobs.route.js";
import notificationRoutes from "@/routes/notification.route.js";
import analyticsRoutes from "@/routes/analytics.route.js";
import assessmentRoutes from "@/routes/assessment.route.js";
import interviewRoutes from "@/routes/interview.route.js";
import interviewRoleRoutes from "@/routes/interview-role.route.js";
import interviewQuestionRoutes from "@/routes/interview-question.route.js";
import conversationRoutes from "@/routes/conversation.route.js";
import messageRoutes from "@/routes/message.route.js";
import employerRoutes from "@/routes/employer.route.js";
import aiRoutes from "@/routes/ai.route.js";
import adminRoutes from "@/routes/admin.route.js";
import generationRoutes from "@/routes/generation.route.js";
import terminationReviewRoutes from "@/routes/termination-review.route.js";

// middlewares import
import { errorHandler } from "@/middlewares/errorHandler.js";
import { notFoundMiddleware } from "@/middlewares/notFound.js";


dotenv.config();

const app = express();

// Trust Heroku's proxy so secure cookies work
app.set("trust proxy", 1);

// ─── Log Config ──────────────────────────────────────────────────────────
const stream = {
  write: (message: string) => {
    console.log(message.trim());
  },
};

app.use(morgan("tiny", { stream }));

// ─── Security Middlewares ────────────────────────────────────────────────
// Set security HTTP headers
// app.use(
//   helmet({
//     crossOriginEmbedderPolicy: false,
//   }),
// );

// Enable CORS (Cross-Origin Resource Sharing)
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  "http://localhost:5174",
];
if (process.env.CLIENT_URL) {
  allowedOrigins.push(process.env.CLIENT_URL);
}

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  }),
);

// Rate limiting (Prevents brute-force attacks)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window`
  message: {
    error: "Too many requests from this IP, please try again after 15 minutes",
  },
});

// ─── Parser Middleware ───────────────────────────────────────────────────
app.use(express.json());
app.use(cookieParser());

// ─── Health Check ────────────────────────────────────────────────────────
app.get("/", (_req: Request, res: Response) => {
  res.send(`
    <h1>GradSync API</h1>
    <p>API is running securely. 🚀</p>
  `);
});

app.get("/health", (_req: Request, res: Response) => {
  res.status(200).json({
    status: "ok",
    service: "GradSync API",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  });
});

// ─── API Routes ──────────────────────────────────────────────────────────
const apiRouter = express.Router();

apiRouter.use("/auth", authRoutes);
apiRouter.use("/users", userRoutes);
apiRouter.use("/jobs", jobRoutes);
apiRouter.use("/applications", applicationRoutes);
apiRouter.use("/save-jobs", savedJobsRoutes);
apiRouter.use("/notifications", notificationRoutes);
apiRouter.use("/analytics", analyticsRoutes);
apiRouter.use("/assessments", assessmentRoutes);
apiRouter.use("/interviews", interviewRoutes);
apiRouter.use("/interview-roles", interviewRoleRoutes);
apiRouter.use("/interview-questions", interviewQuestionRoutes);
apiRouter.use("/conversations", conversationRoutes);
apiRouter.use("/messages", messageRoutes);
apiRouter.use("/employer", employerRoutes);
apiRouter.use("/ai", aiRoutes);
apiRouter.use("/admin", adminRoutes);
apiRouter.use("/generation", generationRoutes);
apiRouter.use("/termination-reviews", terminationReviewRoutes);

// mount api routes
app.use("/api", apiRouter);

// ─── Error Middleware ────────────────────────────────────────────────────
app.use(notFoundMiddleware);
app.use(errorHandler);

export default app;
