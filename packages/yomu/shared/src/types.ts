export interface BaseEntity {
  readonly id: string
  readonly createdAt: Date
  readonly updatedAt: Date
}

export type EntityId = string & { readonly __brand: 'EntityId' }

export function createEntityId(value: string): EntityId {
  if (!value || typeof value !== 'string' || value.trim().length === 0) {
    throw new Error('Entity ID must be a non-empty string')
  }
  return value as EntityId
}

export type Timestamp = Date & { readonly __brand: 'Timestamp' }

export function createTimestamp(value?: Date): Timestamp {
  const date = value ?? new Date()
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
    throw new Error('Invalid timestamp')
  }
  return date as Timestamp
}
