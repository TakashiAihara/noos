export function generateId(): string {
  if (typeof crypto === 'undefined' || typeof crypto.randomUUID !== 'function') {
    throw new Error('crypto.randomUUID is not available in this environment')
  }
  return crypto.randomUUID()
}
