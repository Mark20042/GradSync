import dotenv from "dotenv";

// Load .env file before anything else
dotenv.config();

/**
 * Centralized, typed environment configuration.
 * Validates required variables at import time so the app
 * fails fast instead of crashing later with cryptic errors.
 */

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(
      `❌ Missing required environment variable: ${key}. Check your .env file.`,
    );
  }
  return value;
}

function optionalEnv(key: string, fallback: string): string {
  return process.env[key] ?? fallback;
}

export const env = {
  // Server
  PORT: parseInt(optionalEnv("PORT", "8001"), 10),
  NODE_ENV: optionalEnv("NODE_ENV", "development"),
  BASE_URL: optionalEnv("BASE_URL", "http://localhost:8001"),
  FRONTEND_URL: optionalEnv("FRONTEND_URL", "http://localhost:5173"),

  // Database
  MONGO_URI: requireEnv("MONGO_URI"),

  // Authentication (cookie-based JWT)
  JWT_SECRET: requireEnv("JWT_SECRET"),
  JWT_EXPIRES_IN: optionalEnv("JWT_EXPIRES_IN", "60d"),
  JWT_COOKIE_EXPIRES_IN: optionalEnv("JWT_COOKIE_EXPIRES_IN", "60"),

  // AI Services
  GEMINI_API_KEY: process.env["GEMINI_API_KEY"] ?? "",
  OLLAMA_BASE_URL: optionalEnv("OLLAMA_BASE_URL", "http://127.0.0.1:11434"),
  OLLAMA_MODEL: optionalEnv("OLLAMA_MODEL", "qwen2.5:7b"),

  // Email
  EMAIL_SERVICE: optionalEnv("EMAIL_SERVICE", "gmail"),
  EMAIL_USER: process.env["EMAIL_USER"] ?? "",
  EMAIL_PASSWORD: process.env["EMAIL_PASSWORD"] ?? "",
  EMAIL_FROM: process.env["EMAIL_FROM"] ?? "",

  // Mailtrap (for testing)
  MAILTRAP_TOKEN: process.env["MAILTRAP_TOKEN"] ?? "",
  MAILTRAP_INBOX_ID: process.env["MAILTRAP_INBOX_ID"] ? parseInt(process.env["MAILTRAP_INBOX_ID"]) : undefined,

  // Cloudinary
  CLOUDINARY_CLOUD_NAME: requireEnv("CLOUDINARY_CLOUD_NAME"),
  CLOUDINARY_API_KEY: requireEnv("CLOUDINARY_API_KEY"),
  CLOUDINARY_API_SECRET: requireEnv("CLOUDINARY_API_SECRET"),

  // CORS
  CORS_ORIGINS: optionalEnv(
    "CORS_ORIGINS",
    "http://localhost:3000,http://localhost:5173,http://localhost:5174",
  ).split(","),
} as const;
