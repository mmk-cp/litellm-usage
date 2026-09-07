import "dotenv/config";
import { z } from "zod";

const schema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(4000),
  LITELLM_BASE_URL: z
    .string()
    .url()
    .transform((value) => value.replace(/\/$/, "")),
  LITELLM_ADMIN_KEY: z.string().min(1),
  SESSION_ENCRYPTION_KEY: z.string().regex(/^[a-fA-F0-9]{64}$/, "must be a 32-byte hex key"),
  INTERNAL_API_SECRET: z.string().min(24),
  FRONTEND_ORIGIN: z.string().url().default("http://localhost:3000"),
  LITELLM_TIMEOUT_MS: z.coerce.number().int().positive().default(15000),
});

export type Env = z.infer<typeof schema>;

export function loadEnv(source: NodeJS.ProcessEnv = process.env): Env {
  const result = schema.safeParse(source);
  if (!result.success) {
    const details = result.error.issues
      .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
      .join(", ");
    throw new Error(`Invalid environment configuration: ${details}`);
  }
  return result.data;
}

export const env = loadEnv();
