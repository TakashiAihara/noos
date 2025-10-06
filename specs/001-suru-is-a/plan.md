
# Implementation Plan: Suru Task Management System

**Branch**: `001-suru-is-a` | **Date**: 2025-10-05 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/home/dev/.ghq_src/github.com/TakashiAihara/noos/specs/001-suru-is-a/spec.md`

## Execution Flow (/plan command scope)
```
1. Load feature spec from Input path
   → If not found: ERROR "No feature spec at {path}"
2. Fill Technical Context (scan for NEEDS CLARIFICATION)
   → Detect Project Type from file system structure or context (web=frontend+backend, mobile=app+api)
   → Set Structure Decision based on project type
3. Fill the Constitution Check section based on the content of the constitution document.
4. Evaluate Constitution Check section below
   → If violations exist: Document in Complexity Tracking
   → If no justification possible: ERROR "Simplify approach first"
   → Update Progress Tracking: Initial Constitution Check
5. Execute Phase 0 → research.md
   → If NEEDS CLARIFICATION remain: ERROR "Resolve unknowns"
6. Execute Phase 1 → contracts, data-model.md, quickstart.md, agent-specific template file (e.g., `CLAUDE.md` for Claude Code, `.github/copilot-instructions.md` for GitHub Copilot, `GEMINI.md` for Gemini CLI, `QWEN.md` for Qwen Code, or `AGENTS.md` for all other agents).
7. Re-evaluate Constitution Check section
   → If new violations: Refactor design, return to Phase 1
   → Update Progress Tracking: Post-Design Constitution Check
8. Plan Phase 2 → Describe task generation approach (DO NOT create tasks.md)
9. STOP - Ready for /tasks command
```

**IMPORTANT**: The /plan command STOPS at step 7. Phases 2-4 are executed by other commands:
- Phase 2: /tasks command creates tasks.md
- Phase 3-4: Implementation execution (manual or via tools)

## Summary
Cross-platform task management system with team collaboration, supporting web and mobile. Users can create, organize, and track tasks with full attributes (title, description, status, due date, priority, tags, assignee, subtasks). Teams collaborate through projects, with OAuth authentication, real-time synchronization, and comprehensive push notification support.

## Technical Context
**Language/Version**: TypeScript (latest stable, ES2022+)
**Primary Dependencies**:
  - Backend: Hono (gRPC foundation), Hono RPC (browser communication)
  - Frontend: Vite, React, Zustand (state), Tailwind CSS, shadcn/ui, React Router, Tanstack React Query
  - DDD microservices architecture
**Storage**: PostgreSQL with Prisma/Drizzle ORM
**Testing**: Vitest (unit, integration, contract tests)
**Target Platform**: Web browsers (modern), Mobile (iOS/Android via React Native or PWA)
**Project Type**: mobile (microservices backend + React frontend + mobile clients)
**Performance Goals**:
  - 1000 concurrent requests per service
  - Real-time task synchronization <1s latency
**Constraints**:
  - API response: p95 <200ms
  - Database queries: p95 <50ms
  - Online-only (no offline support)
  - Memory: <512MB per service
  - Frontend bundle: <200KB gzipped
**Scale/Scope**: Multi-team collaboration, 10k+ users, distributed microservices

## Constitution Check
*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### I. Code Quality Excellence
- [x] TypeScript strict mode planned
- [x] Biome formatter configured in monorepo
- [x] Function complexity monitoring (<10 cyclomatic)
- [x] JSDoc for all public APIs

### II. Test-Driven Development (NON-NEGOTIABLE)
- [x] TDD workflow planned (Red-Green-Refactor)
- [x] 80% minimum test coverage target
- [x] Integration tests for all API endpoints
- [x] Contract tests for gRPC/RPC interfaces
- [x] Vitest configured for all test types

### III. User Experience Consistency
- [x] shadcn/ui for consistent design patterns
- [x] <200ms p95 response time target
- [x] Real-time feedback via Zustand state + React Query
- [x] WCAG 2.1 AA accessibility (to be validated)
- [x] Consistent API schema patterns (gRPC/Hono RPC)

### IV. Performance Requirements
- [x] 1000 concurrent requests target
- [x] DB queries <50ms p95
- [x] Memory <512MB per service
- [x] Bundle <200KB gzipped
- [x] Valkey caching for read-heavy operations

**PASS**: All constitutional requirements addressable with planned architecture

## Project Structure

### Documentation (this feature)
```
specs/[###-feature]/
├── plan.md              # This file (/plan command output)
├── research.md          # Phase 0 output (/plan command)
├── data-model.md        # Phase 1 output (/plan command)
├── quickstart.md        # Phase 1 output (/plan command)
├── contracts/           # Phase 1 output (/plan command)
└── tasks.md             # Phase 2 output (/tasks command - NOT created by /plan)
```

### Source Code (repository root)
```
apps/suru/
├── gateway/                 # API Gateway (Hono)
│   ├── src/
│   │   ├── presentation/   # gRPC/RPC handlers
│   │   ├── middleware/     # Auth, CORS, validation
│   │   └── config/
│   └── tests/
│       ├── contract/
│       ├── integration/
│       └── unit/
│
├── services/               # DDD Microservices
│   ├── task-service/
│   │   ├── src/
│   │   │   ├── domain/    # Entities, Value Objects, Aggregates
│   │   │   ├── application/ # Use Cases, DTOs
│   │   │   ├── infrastructure/ # Repositories, gRPC clients
│   │   │   └── presentation/   # gRPC servers
│   │   └── tests/
│   │
│   ├── team-service/
│   │   └── [same structure as task-service]
│   │
│   ├── notification-service/
│   │   └── [same structure as task-service]
│   │
│   └── auth-service/
│       └── [OAuth integration, JWT management]
│
└── web/                    # React Frontend
    ├── src/
    │   ├── features/       # Feature-based modules
    │   │   ├── tasks/
    │   │   ├── teams/
    │   │   ├── projects/
    │   │   └── notifications/
    │   ├── components/     # shadcn/ui + shared components
    │   ├── lib/           # Zustand stores, React Query hooks
    │   ├── routes/        # React Router configuration
    │   └── styles/        # Tailwind config
    └── tests/

packages/suru/
├── common/                 # Shared packages
│   ├── types/             # Shared TypeScript types
│   ├── proto/             # gRPC/Protobuf definitions
│   └── utils/             # Common utilities
```

**Structure Decision**: Microservices architecture with DDD pattern. Gateway handles all external traffic (web/mobile), routing to domain services via gRPC. Each service is independently deployable with clear bounded contexts (Task, Team, Notification, Auth). Frontend communicates via Hono RPC through gateway.

## Phase 0: Outline & Research
1. **Extract unknowns from Technical Context** above:
   - For each NEEDS CLARIFICATION → research task
   - For each dependency → best practices task
   - For each integration → patterns task

2. **Generate and dispatch research agents**:
   ```
   For each unknown in Technical Context:
     Task: "Research {unknown} for {feature context}"
   For each technology choice:
     Task: "Find best practices for {tech} in {domain}"
   ```

3. **Consolidate findings** in `research.md` using format:
   - Decision: [what was chosen]
   - Rationale: [why chosen]
   - Alternatives considered: [what else evaluated]

**Output**: research.md with all NEEDS CLARIFICATION resolved

## Phase 1: Design & Contracts
*Prerequisites: research.md complete*

1. **Extract entities from feature spec** → `data-model.md`:
   - Entity name, fields, relationships
   - Validation rules from requirements
   - State transitions if applicable

2. **Generate API contracts** from functional requirements:
   - For each user action → endpoint
   - Use standard REST/GraphQL patterns
   - Output OpenAPI/GraphQL schema to `/contracts/`

3. **Generate contract tests** from contracts:
   - One test file per endpoint
   - Assert request/response schemas
   - Tests must fail (no implementation yet)

4. **Extract test scenarios** from user stories:
   - Each story → integration test scenario
   - Quickstart test = story validation steps

5. **Update agent file incrementally** (O(1) operation):
   - Run `.specify/scripts/bash/update-agent-context.sh claude`
     **IMPORTANT**: Execute it exactly as specified above. Do not add or remove any arguments.
   - If exists: Add only NEW tech from current plan
   - Preserve manual additions between markers
   - Update recent changes (keep last 3)
   - Keep under 150 lines for token efficiency
   - Output to repository root

**Output**: data-model.md, /contracts/*, failing tests, quickstart.md, agent-specific file

## Phase 2: Task Planning Approach
*This section describes what the /tasks command will do - DO NOT execute during /plan*

**Task Generation Strategy**:
- Load `.specify/templates/tasks-template.md` as base
- Generate tasks from Phase 1 design docs (contracts, data model, quickstart)
- Each .proto contract → protobuf generation + contract test task [P]
- Each domain entity → value object + entity + repository tasks [P]
- Each gRPC service → service implementation + gRPC server tasks
- Each use case → application service task
- Each quickstart scenario → integration test task
- Frontend components from UI requirements [P]

**Service-by-Service Breakdown**:

1. **Infrastructure Setup** (5-7 tasks):
   - Monorepo structure creation
   - Shared packages (proto, types, utils)
   - Database schema migration
   - gRPC code generation pipeline

2. **Auth Service** (8-10 tasks):
   - OAuth integration (Google/GitHub)
   - JWT token generation/validation
   - User domain model
   - Auth gRPC service
   - Contract tests [P]

3. **Task Service** (12-15 tasks):
   - Task aggregate (entities, value objects)
   - Subtask hierarchy
   - Task repository
   - Use cases (Create, Update, Delete, Assign)
   - gRPC service implementation
   - Contract tests [P]
   - Integration tests [P]

4. **Team Service** (10-12 tasks):
   - Team, Project, Member entities
   - Role-based authorization
   - Team repository, Project repository
   - Use cases (Team CRUD, Project CRUD, Member management)
   - gRPC service
   - Contract tests [P]

5. **Notification Service** (8-10 tasks):
   - Notification entity
   - Push notification integration (Web Push + FCM)
   - Domain event subscribers (TaskAssigned, etc.)
   - Reminder scheduler
   - gRPC service
   - Contract tests [P]

6. **Gateway** (6-8 tasks):
   - Hono HTTP server setup
   - Hono RPC → gRPC translation
   - WebSocket real-time handler
   - JWT middleware
   - CORS configuration
   - Integration tests

7. **Frontend (Web)** (15-18 tasks):
   - Vite + React setup
   - Zustand stores (UI state)
   - React Query hooks (server state)
   - shadcn/ui component integration
   - Feature modules [P]:
     * Tasks (board, detail, create/edit)
     * Teams (list, create, members)
     * Projects (list, create)
     * Notifications (bell icon, list)
   - React Router routes
   - OAuth callback handler
   - WebSocket connection
   - E2E tests (Playwright)

**Ordering Strategy**:
1. **Phase 3.1: Infrastructure** (parallel where possible)
   - Monorepo structure
   - Shared proto definitions
   - Database setup

2. **Phase 3.2: Contract Tests First (TDD)** [all parallel]
   - All .proto → TypeScript types
   - Contract test files (must fail)

3. **Phase 3.3: Domain Layer** [parallel per service]
   - Entities, Value Objects per bounded context
   - Repositories (interfaces)

4. **Phase 3.4: Application Layer** [parallel per service]
   - Use cases
   - DTOs
   - Domain event handling

5. **Phase 3.5: Infrastructure Layer** [parallel per service]
   - Repository implementations (Prisma)
   - gRPC servers
   - gRPC clients

6. **Phase 3.6: Gateway Integration**
   - Hono RPC endpoints
   - Middleware
   - WebSocket

7. **Phase 3.7: Frontend** [parallel components]
   - Base setup
   - Feature modules
   - Integration

8. **Phase 3.8: Real-time & Notifications**
   - WebSocket streaming
   - Push notification delivery
   - Event broadcasting

9. **Phase 3.9: Polish**
   - E2E tests
   - Performance optimization
   - Accessibility validation

**Estimated Output**: 70-85 numbered, ordered tasks in tasks.md

**Parallel Execution**:
- All contract tests can run simultaneously
- Domain models per service are independent
- Frontend components are independent
- Mark tasks with [P] when no cross-file dependencies

**IMPORTANT**: This phase is executed by the /tasks command, NOT by /plan

## Phase 3+: Future Implementation
*These phases are beyond the scope of the /plan command*

**Phase 3**: Task execution (/tasks command creates tasks.md)  
**Phase 4**: Implementation (execute tasks.md following constitutional principles)  
**Phase 5**: Validation (run tests, execute quickstart.md, performance validation)

## Complexity Tracking
*Fill ONLY if Constitution Check has violations that must be justified*

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |


## Progress Tracking
*This checklist is updated during execution flow*

**Phase Status**:
- [x] Phase 0: Research complete (/plan command)
- [x] Phase 1: Design complete (/plan command)
- [x] Phase 2: Task planning complete (/plan command - describe approach only)
- [x] Phase 3: Tasks generated (/tasks command) - 170 tasks ready for execution
- [ ] Phase 4: Implementation complete
- [ ] Phase 5: Validation passed

**Gate Status**:
- [x] Initial Constitution Check: PASS
- [x] Post-Design Constitution Check: PASS
- [x] All NEEDS CLARIFICATION resolved (via /clarify session)
- [x] Complexity deviations documented (None - architecture aligns with constitution)

---
*Based on Constitution v1.0.0 - See `/.specify/memory/constitution.md`*
