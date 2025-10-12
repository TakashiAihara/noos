/**
 * Auth Service gRPC Server Implementation
 */

import { create } from '@bufbuild/protobuf';
import type { ConnectRouter } from '@connectrpc/connect';
import { Code, ConnectError } from '@connectrpc/connect';
import { AuthService } from '@noos/suru-proto/dist/auth-service_connect';
import {
  type GetCurrentUserRequest,
  type GetCurrentUserResponse,
  GetCurrentUserResponseSchema,
  type GetUserRequest,
  type GetUserResponse,
  GetUserResponseSchema,
  type HandleOAuthCallbackRequest,
  type HandleOAuthCallbackResponse,
  HandleOAuthCallbackResponseSchema,
  type InitiateOAuthRequest,
  type InitiateOAuthResponse,
  InitiateOAuthResponseSchema,
  type LogoutRequest,
  type LogoutResponse,
  LogoutResponseSchema,
  OAuthProvider,
  OAuthTokensSchema,
  type RefreshTokenRequest,
  type RefreshTokenResponse,
  RefreshTokenResponseSchema,
  type UpdateUserRequest,
  type UpdateUserResponse,
  UpdateUserResponseSchema,
  UserClaimsSchema,
  UserSchema,
  type ValidateTokenRequest,
  type ValidateTokenResponse,
  ValidateTokenResponseSchema,
} from '@noos/suru-proto/dist/auth-service_pb';

import { GetCurrentUserUseCase } from '../../application/use-cases/get-current-user';
import { GetUserUseCase } from '../../application/use-cases/get-user';
import { HandleOAuthCallbackUseCase } from '../../application/use-cases/handle-oauth-callback';
import { InitiateOAuthUseCase } from '../../application/use-cases/initiate-oauth';
import { LogoutUseCase } from '../../application/use-cases/logout';
import { RefreshTokenUseCase } from '../../application/use-cases/refresh-token';
import { UpdateUserUseCase } from '../../application/use-cases/update-user';
import { ValidateTokenUseCase } from '../../application/use-cases/validate-token';
import type { SessionRepository } from '../../domain/repositories/session-repository';
import type { UserRepository } from '../../domain/repositories/user-repository';

export class AuthServiceHandler {
  private initiateOAuthUseCase: InitiateOAuthUseCase;
  private handleOAuthCallbackUseCase: HandleOAuthCallbackUseCase;
  private refreshTokenUseCase: RefreshTokenUseCase;
  private validateTokenUseCase: ValidateTokenUseCase;
  private logoutUseCase: LogoutUseCase;
  private getUserUseCase: GetUserUseCase;
  private updateUserUseCase: UpdateUserUseCase;
  private getCurrentUserUseCase: GetCurrentUserUseCase;

  constructor(userRepository: UserRepository, sessionRepository: SessionRepository) {
    this.initiateOAuthUseCase = new InitiateOAuthUseCase();
    this.handleOAuthCallbackUseCase = new HandleOAuthCallbackUseCase(
      userRepository,
      sessionRepository,
    );
    this.refreshTokenUseCase = new RefreshTokenUseCase(sessionRepository, userRepository);
    this.validateTokenUseCase = new ValidateTokenUseCase();
    this.logoutUseCase = new LogoutUseCase(sessionRepository);
    this.getUserUseCase = new GetUserUseCase(userRepository);
    this.updateUserUseCase = new UpdateUserUseCase(userRepository);
    this.getCurrentUserUseCase = new GetCurrentUserUseCase(userRepository);
  }

  registerRoutes(router: ConnectRouter): void {
    router.service(AuthService, {
      initiateOAuth: async (req: InitiateOAuthRequest): Promise<InitiateOAuthResponse> => {
        try {
          const result = await this.initiateOAuthUseCase.execute({
            provider: this.mapOAuthProviderFromProto(req.provider),
            redirectUri: req.redirectUri,
          });

          return create(InitiateOAuthResponseSchema, {
            authorizationUrl: result.authorizationUrl,
            state: result.state,
          });
        } catch (error) {
          throw new ConnectError(
            error instanceof Error ? error.message : 'Failed to initiate OAuth',
            Code.Internal,
          );
        }
      },

      handleOAuthCallback: async (
        req: HandleOAuthCallbackRequest,
      ): Promise<HandleOAuthCallbackResponse> => {
        try {
          const result = await this.handleOAuthCallbackUseCase.execute({
            provider: this.mapOAuthProviderFromProto(req.provider),
            code: req.code,
            state: req.state,
          });

          return create(HandleOAuthCallbackResponseSchema, {
            tokens: create(OAuthTokensSchema, {
              accessToken: result.tokens.accessToken,
              refreshToken: result.tokens.refreshToken,
              expiresIn: BigInt(result.tokens.expiresIn),
              tokenType: result.tokens.tokenType,
            }),
            user: create(UserSchema, {
              id: result.user.id,
              email: result.user.email,
              displayName: result.user.displayName || '',
              avatarUrl: result.user.avatarUrl,
              createdAt: result.user.createdAt.toISOString(),
              lastLoginAt: result.user.updatedAt.toISOString(), // TODO: Add lastLoginAt to User entity
            }),
            isNewUser: result.isNewUser,
          });
        } catch (error) {
          if (error instanceof Error && error.message.includes('Invalid state')) {
            throw new ConnectError(error.message, Code.InvalidArgument);
          }
          throw new ConnectError(
            error instanceof Error ? error.message : 'Failed to handle OAuth callback',
            Code.Internal,
          );
        }
      },

      refreshToken: async (req: RefreshTokenRequest): Promise<RefreshTokenResponse> => {
        try {
          const result = await this.refreshTokenUseCase.execute({
            refreshToken: req.refreshToken,
          });

          return create(RefreshTokenResponseSchema, {
            tokens: create(OAuthTokensSchema, {
              accessToken: result.tokens.accessToken,
              refreshToken: result.tokens.refreshToken,
              expiresIn: BigInt(result.tokens.expiresIn),
              tokenType: result.tokens.tokenType,
            }),
          });
        } catch (error) {
          if (
            error instanceof Error &&
            (error.message.includes('Invalid') || error.message.includes('expired'))
          ) {
            throw new ConnectError(error.message, Code.Unauthenticated);
          }
          throw new ConnectError(
            error instanceof Error ? error.message : 'Failed to refresh token',
            Code.Internal,
          );
        }
      },

      validateToken: async (req: ValidateTokenRequest): Promise<ValidateTokenResponse> => {
        try {
          const result = await this.validateTokenUseCase.execute({
            accessToken: req.accessToken,
          });

          return create(ValidateTokenResponseSchema, {
            valid: result.valid,
            claims: result.claims
              ? create(UserClaimsSchema, {
                  userId: result.claims.userId,
                  email: result.claims.email,
                  teamIds: result.claims.teamIds,
                  exp: BigInt(Math.floor(result.claims.exp)),
                })
              : undefined,
          });
        } catch (error) {
          throw new ConnectError(
            error instanceof Error ? error.message : 'Failed to validate token',
            Code.Internal,
          );
        }
      },

      logout: async (req: LogoutRequest): Promise<LogoutResponse> => {
        try {
          const result = await this.logoutUseCase.execute({
            accessToken: req.accessToken,
            refreshToken: req.refreshToken,
          });

          return create(LogoutResponseSchema, {
            success: result.success,
          });
        } catch (error) {
          // Logout should always succeed to prevent token reuse
          return create(LogoutResponseSchema, {
            success: true,
          });
        }
      },

      getUser: async (req: GetUserRequest): Promise<GetUserResponse> => {
        try {
          const result = await this.getUserUseCase.execute({
            userId: req.userId,
          });

          return create(GetUserResponseSchema, {
            user: create(UserSchema, {
              id: result.user.id,
              email: result.user.email,
              displayName: result.user.displayName || '',
              avatarUrl: result.user.avatarUrl,
              createdAt: result.user.createdAt.toISOString(),
              lastLoginAt: result.user.updatedAt.toISOString(), // TODO: Add lastLoginAt to User entity
            }),
          });
        } catch (error) {
          if (error instanceof Error && error.message.includes('not found')) {
            throw new ConnectError(error.message, Code.NotFound);
          }
          throw new ConnectError(
            error instanceof Error ? error.message : 'Failed to get user',
            Code.Internal,
          );
        }
      },

      updateUser: async (req: UpdateUserRequest): Promise<UpdateUserResponse> => {
        try {
          const result = await this.updateUserUseCase.execute({
            userId: req.userId,
            displayName: req.displayName,
            avatarUrl: req.avatarUrl,
          });

          return create(UpdateUserResponseSchema, {
            user: create(UserSchema, {
              id: result.user.id,
              email: result.user.email,
              displayName: result.user.displayName || '',
              avatarUrl: result.user.avatarUrl,
              createdAt: result.user.createdAt.toISOString(),
              lastLoginAt: result.user.updatedAt.toISOString(), // TODO: Add lastLoginAt to User entity
            }),
          });
        } catch (error) {
          if (error instanceof Error && error.message.includes('not found')) {
            throw new ConnectError(error.message, Code.NotFound);
          }
          throw new ConnectError(
            error instanceof Error ? error.message : 'Failed to update user',
            Code.Internal,
          );
        }
      },

      getCurrentUser: async (req: GetCurrentUserRequest): Promise<GetCurrentUserResponse> => {
        try {
          const result = await this.getCurrentUserUseCase.execute({
            accessToken: req.accessToken,
          });

          return create(GetCurrentUserResponseSchema, {
            user: create(UserSchema, {
              id: result.user.id,
              email: result.user.email,
              displayName: result.user.displayName || '',
              avatarUrl: result.user.avatarUrl,
              createdAt: result.user.createdAt.toISOString(),
              lastLoginAt: result.user.updatedAt.toISOString(), // TODO: Add lastLoginAt to User entity
            }),
            claims: create(UserClaimsSchema, {
              userId: result.claims.userId,
              email: result.claims.email,
              teamIds: result.claims.teamIds,
              exp: BigInt(Math.floor(result.claims.exp)),
            }),
          });
        } catch (error) {
          if (error instanceof Error && error.message.includes('Invalid')) {
            throw new ConnectError(error.message, Code.Unauthenticated);
          }
          if (error instanceof Error && error.message.includes('not found')) {
            throw new ConnectError(error.message, Code.NotFound);
          }
          throw new ConnectError(
            error instanceof Error ? error.message : 'Failed to get current user',
            Code.Internal,
          );
        }
      },
    });
  }

  private mapOAuthProviderFromProto(provider: OAuthProvider): 'GOOGLE' | 'GITHUB' {
    switch (provider) {
      case OAuthProvider.GOOGLE:
        return 'GOOGLE';
      case OAuthProvider.GITHUB:
        return 'GITHUB';
      default:
        return 'GOOGLE';
    }
  }
}
