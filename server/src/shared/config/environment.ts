import dotenv from 'dotenv';

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
      `❌ Missing required environment variable: ${key}. Check your .env file.`
    );
  }
  return value;
}

function optionalEnv(key: string, fallback: string): string {
  return process.env[key] ?? fallback;
}

export const env = {
  // Server
  PORT: parseInt(optionalEnv('PORT', '8001'), 10),
  NODE_ENV: optionalEnv('NODE_ENV', 'development'),
  BASE_URL: optionalEnv('BASE_URL', 'http://localhost:8001'),

  // Database
  MONGO_URI: requireEnv('MONGO_URI'),

  // Authentication
  JWT_SECRET: requireEnv('JWT_SECRET'),
  JWT_EXPIRES_IN: optionalEnv('JWT_EXPIRES_IN', '60d'),

  // AI Services
  GEMINI_API_KEY: process.env['GEMINI_API_KEY'] ?? '',
  OLLAMA_BASE_URL: optionalEnv('OLLAMA_BASE_URL', 'http://127.0.0.1:11434'),
  OLLAMA_MODEL: optionalEnv('OLLAMA_MODEL', 'qwen2.5:7b'),

  // Email
  EMAIL_SERVICE: optionalEnv('EMAIL_SERVICE', 'gmail'),
  EMAIL_USER: process.env['EMAIL_USER'] ?? '',
  EMAIL_PASSWORD: process.env['EMAIL_PASSWORD'] ?? '',
  EMAIL_FROM: process.env['EMAIL_FROM'] ?? '',

  // CORS
  CORS_ORIGINS: optionalEnv(
    'CORS_ORIGINS',
    'http://localhost:3000,http://localhost:5173,http://localhost:5174'
  ).split(','),
} as const;
