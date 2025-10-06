/**
 * Session Entity Tests
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Session } from '../entities/session';

const VALID_USER_ID = '123e4567-e89b-42d3-a456-426614174000';

describe('Session Entity', () => {
  beforeEach(() => {
    // Reset system time
    vi.useRealTimers();
  });

  describe('create', () => {
    it('should create a new session with valid data', () => {
      const session = Session.create({
        userId: VALID_USER_ID,
      });

      expect(session.id).toBeDefined();
      expect(session.userId).toBe(VALID_USER_ID);
      expect(session.refreshToken).toBeDefined();
      expect(session.refreshToken.length).toBeGreaterThanOrEqual(32);
      expect(session.isRevoked).toBe(false);
      expect(session.version).toBe(1);
    });

    it('should set default expiration to 30 days', () => {
      const now = new Date();
      const session = Session.create({
        userId: VALID_USER_ID,
      });

      const expectedExpiry = new Date(now);
      expectedExpiry.setDate(expectedExpiry.getDate() + 30);

      // Allow 1 second difference for test execution time
      const diff = Math.abs(session.expiresAt.getTime() - expectedExpiry.getTime());
      expect(diff).toBeLessThan(1000);
    });

    it('should allow custom expiration days', () => {
      const now = new Date();
      const session = Session.create({
        userId: VALID_USER_ID,
        expiresInDays: 7,
      });

      const expectedExpiry = new Date(now);
      expectedExpiry.setDate(expectedExpiry.getDate() + 7);

      const diff = Math.abs(session.expiresAt.getTime() - expectedExpiry.getTime());
      expect(diff).toBeLessThan(1000);
    });

    it('should allow custom refresh token', () => {
      const customToken = 'a'.repeat(32); // 32 character token

      const session = Session.create({
        userId: VALID_USER_ID,
        refreshToken: customToken,
      });

      expect(session.refreshToken).toBe(customToken);
    });

    it('should reject invalid user ID', () => {
      expect(() =>
        Session.create({
          userId: 'invalid-id',
        }),
      ).toThrow('Invalid UUID format');
    });

    it('should reject short refresh token', () => {
      expect(() =>
        Session.create({
          userId: VALID_USER_ID,
          refreshToken: 'short',
        }),
      ).toThrow('Refresh token must be at least 32 characters');
    });
  });

  describe('isValid', () => {
    it('should return true for valid session', () => {
      const session = Session.create({
        userId: VALID_USER_ID,
      });

      expect(session.isValid()).toBe(true);
    });

    it('should return false for revoked session', () => {
      const session = Session.create({
        userId: VALID_USER_ID,
      });

      session.revoke();

      expect(session.isValid()).toBe(false);
    });

    it('should return false for expired session', () => {
      const session = Session.create({
        userId: VALID_USER_ID,
        expiresInDays: 1,
      });

      // Mock time to be 2 days in the future
      const now = new Date();
      const future = new Date(now);
      future.setDate(future.getDate() + 2);
      vi.setSystemTime(future);

      expect(session.isValid()).toBe(false);
    });
  });

  describe('isExpired', () => {
    it('should return false for non-expired session', () => {
      const session = Session.create({
        userId: VALID_USER_ID,
      });

      expect(session.isExpired()).toBe(false);
    });

    it('should return true for expired session', () => {
      const session = Session.create({
        userId: VALID_USER_ID,
        expiresInDays: 1,
      });

      // Mock time to be 2 days in the future
      const now = new Date();
      const future = new Date(now);
      future.setDate(future.getDate() + 2);
      vi.setSystemTime(future);

      expect(session.isExpired()).toBe(true);
    });
  });

  describe('revoke', () => {
    it('should revoke session successfully', () => {
      const session = Session.create({
        userId: VALID_USER_ID,
      });

      const oldVersion = session.version;

      session.revoke();

      expect(session.isRevoked).toBe(true);
      expect(session.version).toBe(oldVersion + 1);
    });

    it('should reject revoking already revoked session', () => {
      const session = Session.create({
        userId: VALID_USER_ID,
      });

      session.revoke();

      expect(() => session.revoke()).toThrow('Session is already revoked');
    });
  });

  describe('refresh', () => {
    it('should refresh session successfully', () => {
      const session = Session.create({
        userId: VALID_USER_ID,
      });

      const oldToken = session.refreshToken;
      const oldVersion = session.version;

      session.refresh();

      expect(session.refreshToken).not.toBe(oldToken);
      expect(session.version).toBe(oldVersion + 1);
    });

    it('should update expiration when refreshing', () => {
      const session = Session.create({
        userId: VALID_USER_ID,
        expiresInDays: 1,
      });

      const oldExpiry = session.expiresAt;

      session.refresh({ expiresInDays: 7 });

      expect(session.expiresAt.getTime()).toBeGreaterThan(oldExpiry.getTime());
    });

    it('should reject refreshing revoked session', () => {
      const session = Session.create({
        userId: VALID_USER_ID,
      });

      session.revoke();

      expect(() => session.refresh()).toThrow('Cannot refresh revoked session');
    });

    it('should reject refreshing expired session', () => {
      const session = Session.create({
        userId: VALID_USER_ID,
        expiresInDays: 1,
      });

      // Mock time to be 2 days in the future
      const now = new Date();
      const future = new Date(now);
      future.setDate(future.getDate() + 2);
      vi.setSystemTime(future);

      expect(() => session.refresh()).toThrow('Cannot refresh expired session');
    });
  });

  describe('reconstitute', () => {
    it('should reconstitute session from persistence', () => {
      const props = {
        id: '123e4567-e89b-42d3-a456-426614174001',
        userId: VALID_USER_ID,
        refreshToken: 'a'.repeat(32),
        expiresAt: new Date('2024-12-31'),
        isRevoked: false,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-02'),
        version: 2,
      };

      const session = Session.reconstitute(props);

      expect(session.id).toBe(props.id);
      expect(session.userId).toBe(props.userId);
      expect(session.refreshToken).toBe(props.refreshToken);
      expect(session.isRevoked).toBe(props.isRevoked);
      expect(session.version).toBe(props.version);
    });
  });
});
