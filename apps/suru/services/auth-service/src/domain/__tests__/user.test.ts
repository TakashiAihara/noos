/**
 * User Entity Tests
 */

import { describe, it, expect } from 'vitest';
import { User } from '../entities/user';

const VALID_EMAIL = 'test@example.com';
const VALID_PASSWORD_HASH = '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy';

describe('User Entity', () => {
  describe('create', () => {
    it('should create a new user with valid data', () => {
      const user = User.create({
        email: VALID_EMAIL,
        passwordHash: VALID_PASSWORD_HASH,
      });

      expect(user.id).toBeDefined();
      expect(user.email).toBe(VALID_EMAIL);
      expect(user.isActive).toBe(true);
      expect(user.isEmailVerified).toBe(false);
      expect(user.version).toBe(1);
    });

    it('should normalize email to lowercase', () => {
      const user = User.create({
        email: 'Test@Example.COM',
        passwordHash: VALID_PASSWORD_HASH,
      });

      expect(user.email).toBe('test@example.com');
    });

    it('should reject invalid email format', () => {
      expect(() =>
        User.create({
          email: 'invalid-email',
          passwordHash: VALID_PASSWORD_HASH,
        }),
      ).toThrow('Invalid email format');
    });

    it('should reject invalid password hash format', () => {
      expect(() =>
        User.create({
          email: VALID_EMAIL,
          passwordHash: 'invalid-hash',
        }),
      ).toThrow('Invalid password hash format');
    });
  });

  describe('changePassword', () => {
    it('should change password successfully', () => {
      const user = User.create({
        email: VALID_EMAIL,
        passwordHash: VALID_PASSWORD_HASH,
      });

      const newPasswordHash =
        '$2b$10$K8YdF2mQ3pLnR4sT6uV7wOxYz1AbCdEfGhIjKlMnOpQrStUvWxYz0';
      const oldVersion = user.version;

      user.changePassword(newPasswordHash);

      expect(user.passwordHash).toBe(newPasswordHash);
      expect(user.version).toBe(oldVersion + 1);
    });

    it('should reject password change for inactive user', () => {
      const user = User.create({
        email: VALID_EMAIL,
        passwordHash: VALID_PASSWORD_HASH,
      });

      user.deactivate();

      expect(() =>
        user.changePassword(
          '$2b$10$K8YdF2mQ3pLnR4sT6uV7wOxYz1AbCdEfGhIjKlMnOpQrStUvWxYz0',
        ),
      ).toThrow('Cannot change password for inactive user');
    });
  });

  describe('verifyEmail', () => {
    it('should verify email successfully', () => {
      const user = User.create({
        email: VALID_EMAIL,
        passwordHash: VALID_PASSWORD_HASH,
      });

      const oldVersion = user.version;

      user.verifyEmail();

      expect(user.isEmailVerified).toBe(true);
      expect(user.version).toBe(oldVersion + 1);
    });

    it('should reject verifying already verified email', () => {
      const user = User.create({
        email: VALID_EMAIL,
        passwordHash: VALID_PASSWORD_HASH,
      });

      user.verifyEmail();

      expect(() => user.verifyEmail()).toThrow('Email is already verified');
    });
  });

  describe('deactivate', () => {
    it('should deactivate user successfully', () => {
      const user = User.create({
        email: VALID_EMAIL,
        passwordHash: VALID_PASSWORD_HASH,
      });

      const oldVersion = user.version;

      user.deactivate();

      expect(user.isActive).toBe(false);
      expect(user.version).toBe(oldVersion + 1);
    });

    it('should reject deactivating already inactive user', () => {
      const user = User.create({
        email: VALID_EMAIL,
        passwordHash: VALID_PASSWORD_HASH,
      });

      user.deactivate();

      expect(() => user.deactivate()).toThrow('User is already inactive');
    });
  });

  describe('reactivate', () => {
    it('should reactivate user successfully', () => {
      const user = User.create({
        email: VALID_EMAIL,
        passwordHash: VALID_PASSWORD_HASH,
      });

      user.deactivate();
      const oldVersion = user.version;

      user.reactivate();

      expect(user.isActive).toBe(true);
      expect(user.version).toBe(oldVersion + 1);
    });

    it('should reject reactivating already active user', () => {
      const user = User.create({
        email: VALID_EMAIL,
        passwordHash: VALID_PASSWORD_HASH,
      });

      expect(() => user.reactivate()).toThrow('User is already active');
    });
  });

  describe('changeEmail', () => {
    it('should change email successfully', () => {
      const user = User.create({
        email: VALID_EMAIL,
        passwordHash: VALID_PASSWORD_HASH,
      });

      user.verifyEmail();
      const oldVersion = user.version;

      user.changeEmail('newemail@example.com');

      expect(user.email).toBe('newemail@example.com');
      expect(user.isEmailVerified).toBe(false); // Should reset verification
      expect(user.version).toBe(oldVersion + 1);
    });

    it('should reject email change for inactive user', () => {
      const user = User.create({
        email: VALID_EMAIL,
        passwordHash: VALID_PASSWORD_HASH,
      });

      user.deactivate();

      expect(() => user.changeEmail('newemail@example.com')).toThrow(
        'Cannot change email for inactive user',
      );
    });

    it('should reject invalid email format', () => {
      const user = User.create({
        email: VALID_EMAIL,
        passwordHash: VALID_PASSWORD_HASH,
      });

      expect(() => user.changeEmail('invalid-email')).toThrow(
        'Invalid email format',
      );
    });
  });

  describe('canLogin', () => {
    it('should return true for active user', () => {
      const user = User.create({
        email: VALID_EMAIL,
        passwordHash: VALID_PASSWORD_HASH,
      });

      expect(user.canLogin()).toBe(true);
    });

    it('should return false for inactive user', () => {
      const user = User.create({
        email: VALID_EMAIL,
        passwordHash: VALID_PASSWORD_HASH,
      });

      user.deactivate();

      expect(user.canLogin()).toBe(false);
    });
  });

  describe('reconstitute', () => {
    it('should reconstitute user from persistence', () => {
      const props = {
        id: '123e4567-e89b-42d3-a456-426614174000',
        email: VALID_EMAIL,
        passwordHash: VALID_PASSWORD_HASH,
        isActive: true,
        isEmailVerified: true,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-02'),
        version: 2,
      };

      const user = User.reconstitute(props);

      expect(user.id).toBe(props.id);
      expect(user.email).toBe(props.email);
      expect(user.isActive).toBe(props.isActive);
      expect(user.isEmailVerified).toBe(props.isEmailVerified);
      expect(user.version).toBe(props.version);
    });
  });
});
