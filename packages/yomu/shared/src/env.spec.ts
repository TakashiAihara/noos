import { describe, expect, it } from 'vitest'
import { z } from 'zod'
import { EnvironmentValidationError, baseEnvSchema, validateEnv } from './env'

describe('validateEnv', () => {
  it('should validate valid environment variables', () => {
    const testEnv = {
      NODE_ENV: 'development',
      PORT: '3000',
    }

    const result = validateEnv(baseEnvSchema, testEnv)

    expect(result.NODE_ENV).toBe('development')
    expect(result.PORT).toBe(3000)
  })

  it('should use default values when environment variables are missing', () => {
    const testEnv = {}

    const result = validateEnv(baseEnvSchema, testEnv)

    expect(result.NODE_ENV).toBe('development')
    expect(result.PORT).toBeUndefined()
  })

  it('should throw EnvironmentValidationError for invalid NODE_ENV', () => {
    const testEnv = {
      NODE_ENV: 'invalid',
    }

    expect(() => validateEnv(baseEnvSchema, testEnv)).toThrow(EnvironmentValidationError)

    try {
      validateEnv(baseEnvSchema, testEnv)
    } catch (error) {
      if (error instanceof EnvironmentValidationError) {
        expect(error.errors).toHaveLength(1)
        expect(error.errors[0]?.field).toBe('NODE_ENV')
        expect(error.errors[0]?.receivedValue).toBe('invalid')
      }
    }
  })

  it('should throw EnvironmentValidationError for invalid PORT', () => {
    const testEnv = {
      PORT: 'not-a-number',
    }

    expect(() => validateEnv(baseEnvSchema, testEnv)).toThrow(EnvironmentValidationError)
  })

  it('should throw EnvironmentValidationError for PORT out of range', () => {
    const testEnv = {
      PORT: '70000',
    }

    expect(() => validateEnv(baseEnvSchema, testEnv)).toThrow(EnvironmentValidationError)
  })

  it('should handle custom schema extension', () => {
    const customSchema = baseEnvSchema.extend({
      CUSTOM_VAR: z.string().min(1),
    })

    const testEnv = {
      NODE_ENV: 'production',
      CUSTOM_VAR: 'test-value',
    }

    const result = validateEnv(customSchema, testEnv)

    expect(result.NODE_ENV).toBe('production')
    expect(result.CUSTOM_VAR).toBe('test-value')
  })
})
