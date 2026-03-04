import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(4000),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  REDIS_URL: z.string().min(1, "REDIS_URL is required"),
  ACCESS_TOKEN_SECRET: z.string().min(32, "ACCESS_TOKEN_SECRET must be at least 32 characters"),
  REFRESH_TOKEN_SECRET: z.string().min(32, "REFRESH_TOKEN_SECRET must be at least 32 characters"),
  ACCESS_TOKEN_EXPIRES_IN_MINUTES: z.coerce.number().int().positive().default(15),
  REFRESH_TOKEN_EXPIRES_IN_DAYS: z.coerce.number().int().positive().default(7),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const errorMessages = parsed.error.issues.map((issue) => issue.message).join(", ");

  throw new Error(`Invalid environment configuration: ${errorMessages}`);
}

export const env = {
  nodeEnv: parsed.data.NODE_ENV,
  port: parsed.data.PORT,
  databaseUrl: parsed.data.DATABASE_URL,
  redisUrl: parsed.data.REDIS_URL,
  accessTokenSecret: parsed.data.ACCESS_TOKEN_SECRET,
  refreshTokenSecret: parsed.data.REFRESH_TOKEN_SECRET,
  accessTokenExpiresInMinutes: parsed.data.ACCESS_TOKEN_EXPIRES_IN_MINUTES,
  refreshTokenExpiresInDays: parsed.data.REFRESH_TOKEN_EXPIRES_IN_DAYS,
};
