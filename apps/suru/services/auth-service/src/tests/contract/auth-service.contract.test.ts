/**
 * Contract tests for Auth Service gRPC interface
 */

import { createPromiseClient } from '@connectrpc/connect';
import { createGrpcTransport } from '@connectrpc/connect-node';
import { AuthService } from '@noos/suru-proto';
import type {
  HandleOAuthCallbackRequest,
  InitiateOAuthRequest,
  RefreshTokenRequest,
  ValidateTokenRequest,
} from '@noos/suru-proto';
import { describe, expect, it } from 'vitest';

const TEST_PORT = 50053;
const transport = createGrpcTransport({
  baseUrl: `http://localhost:${TEST_PORT}`,
  httpVersion: '2',
});

const client = createPromiseClient(AuthService, transport);

describe('Auth Service Contract', () => {
  describe('InitiateOAuth', () => {
    it('should return authorization URL for Google', async () => {
      const request: InitiateOAuthRequest = {
        provider: 'GOOGLE',
        redirectUri: 'http://localhost:3000/auth/callback',
      };

      const response = await client.initiateOAuth(request);

      expect(response.authorizationUrl).toContain('https://accounts.google.com');
      expect(response.state).toBeDefined();
      expect(response.state.length).toBeGreaterThan(20); // CSRF token
    });

    it('should return authorization URL for GitHub', async () => {
      const request: InitiateOAuthRequest = {
        provider: 'GITHUB',
        redirectUri: 'http://localhost:3000/auth/callback',
      };

      const response = await client.initiateOAuth(request);

      expect(response.authorizationUrl).toContain('https://github.com/login');
      expect(response.state).toBeDefined();
    });
  });

  describe('HandleOAuthCallback', () => {
    it('should exchange code for tokens and return user', async () => {
      const request: HandleOAuthCallbackRequest = {
        provider: 'GOOGLE',
        code: 'mock-authorization-code',
        state: 'valid-csrf-token',
      };

      const response = await client.handleOAuthCallback(request);

      expect(response.tokens).toBeDefined();
      expect(response.tokens?.accessToken).toBeDefined();
      expect(response.tokens?.refreshToken).toBeDefined();
      expect(response.tokens?.tokenType).toBe('Bearer');
      expect(response.user).toBeDefined();
      expect(response.user?.email).toBeDefined();
    });

    it('should create new user on first OAuth login', async () => {
      const request: HandleOAuthCallbackRequest = {
        provider: 'GITHUB',
        code: 'new-user-code',
        state: 'valid-csrf-token',
      };

      const response = await client.handleOAuthCallback(request);

      expect(response.isNewUser).toBe(true);
      expect(response.user).toBeDefined();
    });

    it('should reject invalid CSRF state', async () => {
      const request: HandleOAuthCallbackRequest = {
        provider: 'GOOGLE',
        code: 'valid-code',
        state: 'invalid-state',
      };

      await expect(client.handleOAuthCallback(request)).rejects.toThrow('INVALID_ARGUMENT');
    });
  });

  describe('ValidateToken', () => {
    it('should validate a valid JWT token', async () => {
      const request: ValidateTokenRequest = {
        accessToken: 'valid.jwt.token',
      };

      const response = await client.validateToken(request);

      expect(response.valid).toBe(true);
      expect(response.claims).toBeDefined();
      expect(response.claims?.userId).toBeDefined();
      expect(response.claims?.email).toBeDefined();
    });

    it('should reject expired token', async () => {
      const request: ValidateTokenRequest = {
        accessToken: 'expired.jwt.token',
      };

      const response = await client.validateToken(request);

      expect(response.valid).toBe(false);
      expect(response.claims).toBeUndefined();
    });

    it('should reject tampered token', async () => {
      const request: ValidateTokenRequest = {
        accessToken: 'tampered.jwt.token',
      };

      const response = await client.validateToken(request);

      expect(response.valid).toBe(false);
    });
  });

  describe('RefreshToken', () => {
    it('should issue new tokens with valid refresh token', async () => {
      const request: RefreshTokenRequest = {
        refreshToken: 'valid-refresh-token',
      };

      const response = await client.refreshToken(request);

      expect(response.tokens).toBeDefined();
      expect(response.tokens?.accessToken).toBeDefined();
      expect(response.tokens?.refreshToken).toBeDefined();
      expect(response.tokens?.expiresIn).toBeGreaterThan(0);
    });

    it('should reject invalid refresh token', async () => {
      const request: RefreshTokenRequest = {
        refreshToken: 'invalid-token',
      };

      await expect(client.refreshToken(request)).rejects.toThrow('UNAUTHENTICATED');
    });
  });
});
