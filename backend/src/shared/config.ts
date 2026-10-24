import { z } from 'zod';

// Lowercased like login input, so the seeded accounts can always sign in.
const email = z.string().trim().toLowerCase().pipe(z.email());

const configSchema = z.object({
  DATABASE_URL: z.url(),
  PORT: z.coerce.number().int().positive(),
  JWT_SECRET: z.string().min(1),
  JWT_EXPIRES_IN: z.string().min(1),
  ADMIN_EMAIL: email,
  ADMIN_PASSWORD: z.string().min(1),
  DEMO_USER_EMAIL: email,
  DEMO_USER_PASSWORD: z.string().min(1),
  CORS_ORIGIN: z.string().min(1),
});

export type Config = z.infer<typeof configSchema>;

/**
 * Reads and validates the environment once at startup.
 * Every problem is reported in a single error, so a broken .env is fixed in one pass.
 */
export function loadConfig(env: NodeJS.ProcessEnv = process.env): Config {
  const result = configSchema.safeParse(env);

  if (!result.success) {
    const problems = result.error.issues
      .map((issue) => `- ${issue.path.join('.')}: ${issue.message}`)
      .join('\n');
    throw new Error(`Invalid environment configuration:\n${problems}`);
  }

  return result.data;
}
