import { z } from 'zod';

export const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).default('3000'),
  DATABASE_URL: z.string().optional(),
  JWT_SECRET: z.string().optional(),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
});

export type Env = z.infer<typeof envSchema>;

export const parseEnv = (env: Record<string, string | undefined> = process.env): Env => {
  const result = envSchema.safeParse(env);

  if (!result.success) {
    console.error('Invalid environment variables:', result.error.format());
    throw new Error('Invalid environment variables');
  }

  return result.data;
};

export const createConfig = <T extends z.ZodSchema>(
  schema: T,
  env: Record<string, string | undefined> = process.env
): z.infer<T> => {
  const result = schema.safeParse(env);

  if (!result.success) {
    console.error('Invalid configuration:', result.error.format());
    throw new Error('Invalid configuration');
  }

  return result.data;
};