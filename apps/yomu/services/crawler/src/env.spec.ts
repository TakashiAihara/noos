import { describe, expect, it, vi } from 'vitest'

describe('Crawler Service Environment', () => {
  it('should validate environment variables', async () => {
    const originalEnv = process.env

    process.env = {
      ...originalEnv,
      NODE_ENV: 'test',
      PORT: '50054',
    }

    vi.resetModules()
    const { env } = await import('./env')

    expect(env.NODE_ENV).toBe('test')
    expect(env.PORT).toBe(50054)

    process.env = originalEnv
  })

  it('should use default PORT when not provided', async () => {
    const originalEnv = process.env

    process.env = {
      NODE_ENV: 'test',
    }

    vi.resetModules()
    const { env } = await import('./env')

    expect(env.PORT).toBe(50054)

    process.env = originalEnv
  })

  it('should throw on invalid PORT format', async () => {
    const originalEnv = process.env

    process.env = {
      ...originalEnv,
      PORT: 'abc',
    }

    vi.resetModules()

    await expect(async () => await import('./env')).rejects.toThrow()

    process.env = originalEnv
  })

  it('should throw on negative PORT', async () => {
    const originalEnv = process.env

    process.env = {
      ...originalEnv,
      PORT: '-1',
    }

    vi.resetModules()

    await expect(async () => await import('./env')).rejects.toThrow()

    process.env = originalEnv
  })

  it('should accept valid NODE_ENV values', async () => {
    const originalEnv = process.env
    const validEnvs = ['development', 'test', 'production']

    for (const nodeEnv of validEnvs) {
      process.env = {
        ...originalEnv,
        NODE_ENV: nodeEnv,
      }

      vi.resetModules()
      const { env } = await import('./env')

      expect(env.NODE_ENV).toBe(nodeEnv)
    }

    process.env = originalEnv
  })
})
