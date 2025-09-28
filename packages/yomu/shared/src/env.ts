import { z } from 'zod'

const portSchema = z.coerce.number().int().min(1).max(65535)
const nodeEnvSchema = z.enum(['development', 'production', 'test']).default('development')

export const baseEnvSchema = z.object({
  NODE_ENV: nodeEnvSchema,
  PORT: portSchema.optional(),
})

export interface EnvValidationError {
  readonly field: string
  readonly message: string
  readonly receivedValue: unknown
}

export class EnvironmentValidationError extends Error {
  public readonly errors: readonly EnvValidationError[]

  constructor(errors: readonly EnvValidationError[]) {
    const message = `Environment validation failed:\n${errors
      .map((err) => `${err.field}: ${err.message} (received: ${String(err.receivedValue)})`)
      .join('\n')}`
    super(message)
    this.name = 'EnvironmentValidationError'
    this.errors = errors
  }
}

export function validateEnv<T extends z.ZodRawShape>(
  schema: z.ZodObject<T>,
  env: Readonly<Record<string, string | undefined>> = process.env,
): z.infer<z.ZodObject<T>> {
  const result = schema.safeParse(env)

  if (!result.success) {
    const errors: EnvValidationError[] = result.error.issues.map((issue) => ({
      field: issue.path.join('.'),
      message: issue.message,
      receivedValue: issue.path.reduce((obj: unknown, key) => {
        return obj != null && typeof obj === 'object' && key in obj
          ? (obj as Record<string, unknown>)[key]
          : undefined
      }, env),
    }))
    throw new EnvironmentValidationError(errors)
  }

  return result.data
}

export type BaseEnv = z.infer<typeof baseEnvSchema>
