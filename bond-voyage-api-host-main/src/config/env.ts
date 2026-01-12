import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  DIRECT_URL: z.string().optional(),
  JWT_ACCESS_SECRET: z.string().min(1, "JWT_ACCESS_SECRET is required"),
  JWT_REFRESH_SECRET: z.string().min(1, "JWT_REFRESH_SECRET is required"),
  JWT_ACCESS_EXPIRE: z.string().optional(),
  JWT_REFRESH_EXPIRE: z.string().optional(),
  FRONTEND_URL: z.string().optional(),
  CORS_ORIGINS: z.string().optional(),
  BODY_LIMIT: z.string().optional(),
  PORT: z.string().optional(),
  NODE_ENV: z.string().optional(),
  BCRYPT_SALT_ROUNDS: z.string().optional(),
  REDIS_URL: z.string().optional(),
  REDIS_PORT: z.string().optional(),
  OPENWEATHER_API_KEY: z.string().optional(),
  GEOAPIFY_API_KEY: z.string().optional(),
  GEMINI_API_KEY: z.string().optional(),
  GEMINI_MODEL: z.string().optional(),
  BREVO_API_KEY: z.string().optional(),
  RESEND_API_KEY: z.string().optional(),
  EMAIL_FROM: z.string().optional(),
  GMAIL_USER: z.string().optional(),
  GMAIL_APP_PASSWORD: z.string().optional(),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error("❌ Invalid environment configuration");
  console.error(parsedEnv.error.flatten().fieldErrors);
  throw new Error("ENV_VALIDATION_FAILED");
}

export const env = parsedEnv.data;

/**
 * Resolves CORS origins with proper fallback logic
 * Priority: CORS_ORIGINS > FRONTEND_URL > localhost:3000
 */
export const resolveCorsOrigins = (): string[] => {
  // 1. Prefer CORS_ORIGINS if explicitly set
  const corsOriginsRaw = env.CORS_ORIGINS?.trim();
  
  if (corsOriginsRaw && corsOriginsRaw.length > 0) {
    const origins = corsOriginsRaw
      .split(",")
      .map((origin) => origin.trim())
      .filter(Boolean); // Remove empty strings

    if (origins.length > 0) {
      return origins;
    }
  }

  // 2. Fallback to FRONTEND_URL if available
  const frontendUrl = env.FRONTEND_URL?.trim();
  if (frontendUrl && frontendUrl.length > 0) {
    return [frontendUrl];
  }

  // 3. Final fallback: localhost development
  return ["http://localhost:3000"];
};