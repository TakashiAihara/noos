import { describe, expect, it, vi } from 'vitest'

describe('Article Service Environment', () => {
  it('should validate environment variables', async () => {
    const originalEnv = process.env

    process.env = {
      ...originalEnv,
      NODE_ENV: 'test',
      PORT: '50053',
    }

    vi.resetModules()
    const { env } = await import('./env')

    expect(env.NODE_ENV).toBe('test')
    expect(env.PORT).toBe(50053)

    process.env = originalEnv
  })

  it('should use default PORT when not provided', async () => {
    const originalEnv = process.env

    process.env = {
      NODE_ENV: 'test',
    }

    vi.resetModules()
    const { env } = await import('./env')

    expect(env.PORT).toBe(50053)

    process.env = originalEnv
  })

  it('should throw on invalid PORT', async () => {
    const originalEnv = process.env

    process.env = {
      ...originalEnv,
      PORT: 'not-a-number',
    }

    vi.resetModules()

    await expect(async () => await import('./env')).rejects.toThrow()

    process.env = originalEnv
  })

  it('should throw on PORT out of range', async () => {
    const originalEnv = process.env

    process.env = {
      ...originalEnv,
      PORT: '70000',
    }

    vi.resetModules()

    await expect(async () => await import('./env')).rejects.toThrow()

    process.env = originalEnv
  })
})
