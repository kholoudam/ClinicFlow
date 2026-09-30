import "dotenv/config";
import { z } from "zod";

const schema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(4000),

  JWT_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().default("30m"),

  CORS_ORIGIN: z.string().url(),
  DB_POOL_MAX: z.coerce.number().int().positive().default(10),

  DB_USER: z.string().min(1),
  DB_PASSWORD: z.string().min(1),
  DB_HOST: z.string().min(1),
  DB_PORT: z.coerce.number().int().positive().default(5432),
  DB_NAME: z.string().min(1),
});

export const env = schema.parse(process.env);