/**
 * In-Memory Session Repository Implementation
 * TODO: Replace with Prisma implementation once Session table is added to schema
 */

import { Session } from '../../domain/entities/session';
import type {
  SessionFilters,
  SessionRepository,
} from '../../domain/repositories/session-repository';
import { RefreshToken } from '../../domain/value-objects/refresh-token';
import { SessionId } from '../../domain/value-objects/session-id';
import { UserId } from '../../domain/value-objects/user-id';

export class InMemorySessionRepository implements SessionRepository {
  private sessions: Map<string, Session> = new Map();

  async save(session: Session): Promise<void> {
    this.sessions.set(session.id.toString(), session);
  }

  async findById(id: SessionId): Promise<Session | null> {
    return this.sessions.get(id.toString()) || null;
  }

  async findByRefreshToken(token: RefreshToken): Promise<Session | null> {
    const sessions = Array.from(this.sessions.values());
    return sessions.find((session) => session.refreshToken.toString() === token.toString()) || null;
  }

  async findByUserId(userId: UserId): Promise<Session[]> {
    const sessions = Array.from(this.sessions.values());
    return sessions.filter((session) => session.userId.toString() === userId.toString());
  }

  async findMany(filters: SessionFilters): Promise<{
    sessions: Session[];
    totalCount: number;
  }> {
    let sessions = Array.from(this.sessions.values());

    // Apply filters
    if (filters.userId) {
      sessions = sessions.filter((session) => session.userId.toString() === filters.userId);
    }

    if (filters.isRevoked !== undefined) {
      sessions = sessions.filter((session) => session.isRevoked === filters.isRevoked);
    }

    if (filters.isExpired !== undefined) {
      sessions = sessions.filter((session) => session.isExpired() === filters.isExpired);
    }

    const totalCount = sessions.length;

    // Apply pagination
    const offset = filters.offset || 0;
    const limit = filters.limit || 20;
    sessions = sessions.slice(offset, offset + limit);

    return { sessions, totalCount };
  }

  async delete(id: SessionId): Promise<void> {
    this.sessions.delete(id.toString());
  }

  async deleteByUserId(userId: UserId): Promise<void> {
    const sessions = await this.findByUserId(userId);
    for (const session of sessions) {
      this.sessions.delete(session.id.toString());
    }
  }

  async deleteExpired(): Promise<number> {
    const sessions = Array.from(this.sessions.values());
    let deletedCount = 0;

    for (const session of sessions) {
      if (session.isExpired()) {
        this.sessions.delete(session.id.toString());
        deletedCount++;
      }
    }

    return deletedCount;
  }

  async exists(id: SessionId): Promise<boolean> {
    return this.sessions.has(id.toString());
  }
}
