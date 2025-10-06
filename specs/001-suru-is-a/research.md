# Research: Suru Task Management System

**Date**: 2025-10-05
**Feature**: 001-suru-is-a

## Research Topics

### 1. Hono gRPC Integration for Microservices

**Decision**: Use @hono/node-server with @grpc/grpc-js for service-to-service communication

**Rationale**:
- Hono provides lightweight HTTP layer for gateway
- @grpc/grpc-js is the official gRPC implementation for Node.js
- Hono RPC can expose gRPC services to browsers via HTTP/JSON
- Performance: gRPC binary protocol reduces latency between services

**Alternatives Considered**:
- Pure HTTP/REST between services → Rejected: Higher latency, larger payloads
- tRPC → Rejected: Primarily TypeScript-focused, less cross-language support
- GraphQL Federation → Rejected: Overkill for initial implementation

**Implementation Notes**:
- Define .proto files in packages/suru/common/proto/
- Generate TypeScript types with protoc-gen-ts
- Gateway translates Hono RPC → gRPC → Services

### 2. DDD with TypeScript Best Practices

**Decision**: Use tactical DDD patterns with TypeScript classes and strict typing

**Rationale**:
- Bounded contexts align with microservices (Task, Team, Auth, Notification)
- Value Objects ensure immutability and validation
- Aggregates maintain consistency boundaries
- Repositories abstract persistence layer

**Patterns to Implement**:
- **Entities**: ID-based identity, mutable state
- **Value Objects**: Immutable, equality by value (e.g., TaskTitle, Priority)
- **Aggregates**: Task (root) contains Subtasks, enforces invariants
- **Domain Events**: TaskCreated, TaskAssigned for notification triggers
- **Repositories**: Interface in domain, implementation in infrastructure

**Alternatives Considered**:
- Anemic domain model → Rejected: Violates DDD principles
- Event sourcing → Deferred: Added complexity for v1

### 3. Real-time Synchronization Architecture

**Decision**: WebSocket via Hono + PostgreSQL LISTEN/NOTIFY + Valkey pub/sub

**Rationale**:
- WebSocket for bi-directional communication
- PostgreSQL NOTIFY triggers on task changes
- Valkey pub/sub distributes events across service instances
- React Query for optimistic updates + cache invalidation

**Flow**:
1. Client updates task via Hono RPC
2. Service persists to PostgreSQL, emits domain event
3. PostgreSQL NOTIFY triggers → Valkey pub/sub
4. Gateway receives event, broadcasts via WebSocket
5. React Query invalidates cache, refetches

**Alternatives Considered**:
- Server-Sent Events (SSE) → Rejected: WebSocket provides better mobile support
- Polling → Rejected: Inefficient, higher latency
- Apache Pulsar → Deferred: Overkill for v1, reserve for async processing

### 4. OAuth Integration Strategy

**Decision**: OAuth 2.0 with Passport.js + JWT for session management

**Rationale**:
- Passport.js has mature Google/GitHub strategies
- JWT tokens for stateless authentication
- Refresh tokens stored in PostgreSQL
- Gateway validates JWT, forwards user context to services

**Flow**:
1. User initiates OAuth flow → Gateway redirects to provider
2. Provider callback → Gateway exchanges code for tokens
3. Gateway generates JWT (access + refresh)
4. JWT includes user ID, team IDs for authorization
5. Services validate JWT signature, extract claims

**Alternatives Considered**:
- Session-based auth → Rejected: Stateful, doesn't scale horizontally
- Auth0/Clerk → Deferred: Adds external dependency, cost

### 5. Push Notification Architecture

**Decision**: Web Push API + FCM (Firebase Cloud Messaging) for mobile

**Rationale**:
- Web Push API for browser notifications (service workers)
- FCM for iOS/Android (if React Native)
- Notification service handles scheduling + delivery
- PostgreSQL stores notification preferences

**Implementation**:
- Notification service subscribes to domain events (TaskAssigned, etc.)
- Scheduler checks due dates hourly for reminders
- Service worker in frontend handles background notifications

**Alternatives Considered**:
- Email-only → Rejected: Less immediate
- WebSockets for notifications → Rejected: Requires active connection

### 6. Mobile Strategy

**Decision**: Progressive Web App (PWA) for initial release

**Rationale**:
- Reuse React codebase, faster time-to-market
- Service workers enable offline UI shell (clarification: no offline data)
- Add to home screen on iOS/Android
- Push notifications via Web Push API / FCM

**Future**: React Native if native features required (biometric auth, etc.)

**Alternatives Considered**:
- React Native from start → Rejected: Higher complexity, longer dev time
- Separate native apps → Rejected: Maintenance burden

### 7. State Management with Zustand

**Decision**: Zustand for local UI state, React Query for server state

**Rationale**:
- Zustand: Minimal boilerplate, TypeScript-friendly
- React Query: Caching, invalidation, optimistic updates
- Clear separation: Zustand = UI state, React Query = server data

**Stores**:
- UI state: selected filters, modal open/closed, theme
- Server state: tasks, teams, projects (via React Query)

**Alternatives Considered**:
- Redux → Rejected: Too much boilerplate
- Context API → Rejected: Performance issues with frequent updates

### 8. Testing Strategy with Vitest

**Decision**: Vitest for all test types (unit, integration, contract, E2E)

**Rationale**:
- Vite-native, fast HMR for tests
- Compatible with Jest API, easy migration
- Built-in coverage reporting
- Supports ESM modules natively

**Test Structure**:
- **Contract tests**: Verify gRPC/RPC schemas match
- **Integration tests**: Test service interactions via test containers (PostgreSQL)
- **Unit tests**: Domain logic, value objects, use cases
- **E2E**: Playwright for critical user flows

**Alternatives Considered**:
- Jest → Vitest is faster with Vite projects
- Mocha/Chai → Less integrated with ecosystem

## Technology Summary

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Gateway | Hono + @hono/node-server | HTTP → gRPC routing, Hono RPC |
| Services | Hono + @grpc/grpc-js | Microservices with gRPC |
| Database | PostgreSQL + Prisma | Persistence, LISTEN/NOTIFY |
| Cache | Valkey (Redis) | Pub/sub, read-through caching |
| Frontend | Vite + React + TypeScript | UI |
| State | Zustand + React Query | Local + server state |
| UI | Tailwind + shadcn/ui | Styling + components |
| Routing | React Router v6 | Client-side routing |
| Auth | Passport.js + JWT | OAuth + session mgmt |
| Notifications | Web Push + FCM | Push notifications |
| Real-time | WebSocket + Valkey pub/sub | Live updates |
| Testing | Vitest + Playwright | All test types |
| Monorepo | Turborepo + pnpm | Build orchestration |

## Open Questions Resolved
- ✅ Filtering/sorting (FR-010): Implement via query parameters, Prisma orderBy/where
- ✅ Mobile platform: PWA initially, React Native if needed later
- ✅ gRPC browser compatibility: Hono RPC translates to HTTP/JSON

## Next Steps
Proceed to Phase 1: Design data model and API contracts
