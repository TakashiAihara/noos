# Tasks: Suru Task Management System

**Input**: Design documents from `/home/dev/.ghq_src/github.com/TakashiAihara/noos/specs/001-suru-is-a/`
**Prerequisites**: plan.md, research.md, data-model.md, contracts/, quickstart.md

## Format: `[ID] [P?] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- Include exact file paths in descriptions

## Path Conventions
**Monorepo Structure**: `apps/suru/` contains all services
- **Gateway**: `apps/suru/gateway/`
- **Services**: `apps/suru/services/{task,team,auth,notification}-service/`
- **Web**: `apps/suru/web/`
- **Shared**: `packages/suru/common/`

---

## Phase 3.1: Infrastructure Setup

- [ ] **T001** Create monorepo structure for Suru app in `apps/suru/` with subdirectories: gateway/, services/, web/
- [ ] **T002** Initialize TypeScript configuration with strict mode in `apps/suru/tsconfig.json` and `apps/suru/tsconfig.base.json`
- [ ] **T003** [P] Set up pnpm workspace configuration in `apps/suru/pnpm-workspace.yaml`
- [ ] **T004** [P] Configure Biome formatter and linter in `apps/suru/biome.json`
- [ ] **T005** [P] Create shared proto package in `packages/suru/common/proto/` with .proto files from contracts/
- [ ] **T006** [P] Set up gRPC code generation pipeline using protoc-gen-ts in `packages/suru/common/proto/package.json`
- [ ] **T007** Create PostgreSQL schema migration in `packages/suru/db/migrations/001_initial_schema.sql` based on data-model.md
- [ ] **T008** [P] Configure Prisma schema in `packages/suru/db/prisma/schema.prisma` matching PostgreSQL schema
- [ ] **T009** [P] Set up Valkey (Redis) connection configuration in `packages/suru/common/cache/valkey.ts`
- [ ] **T010** [P] Create shared TypeScript types package in `packages/suru/common/types/` with domain value objects

---

## Phase 3.2: Contract Tests First (TDD) ⚠️ MUST COMPLETE BEFORE 3.3

**CRITICAL: These tests MUST be written and MUST FAIL before ANY implementation**

### gRPC Contract Tests (Parallel)

- [ ] **T011** [P] Generate TypeScript types from task-service.proto in `packages/suru/common/proto/generated/task_pb.ts`
- [ ] **T012** [P] Generate TypeScript types from team-service.proto in `packages/suru/common/proto/generated/team_pb.ts`
- [ ] **T013** [P] Generate TypeScript types from auth-service.proto in `packages/suru/common/proto/generated/auth_pb.ts`
- [ ] **T014** [P] Generate TypeScript types from notification-service.proto in `packages/suru/common/proto/generated/notification_pb.ts`

### Service Contract Tests (Parallel)

- [ ] **T015** [P] Contract test for TaskService.CreateTask in `apps/suru/services/task-service/tests/contract/create-task.test.ts`
- [ ] **T016** [P] Contract test for TaskService.GetTask in `apps/suru/services/task-service/tests/contract/get-task.test.ts`
- [ ] **T017** [P] Contract test for TaskService.ListTasks in `apps/suru/services/task-service/tests/contract/list-tasks.test.ts`
- [ ] **T018** [P] Contract test for TaskService.UpdateTask in `apps/suru/services/task-service/tests/contract/update-task.test.ts`
- [ ] **T019** [P] Contract test for TaskService.AssignTask in `apps/suru/services/task-service/tests/contract/assign-task.test.ts`
- [ ] **T020** [P] Contract test for TeamService.CreateTeam in `apps/suru/services/team-service/tests/contract/create-team.test.ts`
- [ ] **T021** [P] Contract test for TeamService.CreateProject in `apps/suru/services/team-service/tests/contract/create-project.test.ts`
- [ ] **T022** [P] Contract test for TeamService.AddMember in `apps/suru/services/team-service/tests/contract/add-member.test.ts`
- [ ] **T023** [P] Contract test for AuthService.InitiateOAuth in `apps/suru/services/auth-service/tests/contract/initiate-oauth.test.ts`
- [ ] **T024** [P] Contract test for AuthService.HandleOAuthCallback in `apps/suru/services/auth-service/tests/contract/oauth-callback.test.ts`
- [ ] **T025** [P] Contract test for AuthService.ValidateToken in `apps/suru/services/auth-service/tests/contract/validate-token.test.ts`
- [ ] **T026** [P] Contract test for NotificationService.CreateNotification in `apps/suru/services/notification-service/tests/contract/create-notification.test.ts`
- [ ] **T027** [P] Contract test for NotificationService.ListNotifications in `apps/suru/services/notification-service/tests/contract/list-notifications.test.ts`

### Integration Tests from Quickstart Scenarios (Parallel)

- [ ] **T028** [P] Integration test for OAuth authentication flow in `apps/suru/gateway/tests/integration/oauth-flow.test.ts` (Quickstart Scenario 1)
- [ ] **T029** [P] Integration test for team and project creation in `apps/suru/services/team-service/tests/integration/team-project-creation.test.ts` (Quickstart Scenario 2)
- [ ] **T030** [P] Integration test for task creation with full attributes in `apps/suru/services/task-service/tests/integration/task-creation-full.test.ts` (Quickstart Scenario 3)
- [ ] **T031** [P] Integration test for subtask creation in `apps/suru/services/task-service/tests/integration/subtask-creation.test.ts` (Quickstart Scenario 4)
- [ ] **T032** [P] Integration test for task assignment in `apps/suru/services/task-service/tests/integration/task-assignment.test.ts` (Quickstart Scenario 5)
- [ ] **T033** [P] Integration test for real-time task updates in `apps/suru/gateway/tests/integration/realtime-sync.test.ts` (Quickstart Scenario 6)

---

## Phase 3.3: Domain Layer - Task Service (ONLY after tests are failing)

### Task Aggregate (Parallel Value Objects & Entities)

- [ ] **T034** [P] Create TaskId value object in `apps/suru/services/task-service/src/domain/value-objects/task-id.ts`
- [ ] **T035** [P] Create TaskTitle value object with validation (1-200 chars) in `apps/suru/services/task-service/src/domain/value-objects/task-title.ts`
- [ ] **T036** [P] Create TaskDescription value object in `apps/suru/services/task-service/src/domain/value-objects/task-description.ts`
- [ ] **T037** [P] Create TaskStatus enum value object (TODO/IN_PROGRESS/DONE) in `apps/suru/services/task-service/src/domain/value-objects/task-status.ts`
- [ ] **T038** [P] Create Priority enum value object (LOW/MEDIUM/HIGH) in `apps/suru/services/task-service/src/domain/value-objects/priority.ts`
- [ ] **T039** [P] Create Tag value object with validation in `apps/suru/services/task-service/src/domain/value-objects/tag.ts`
- [ ] **T040** Create Task entity (aggregate root) with invariants in `apps/suru/services/task-service/src/domain/entities/task.ts`
- [ ] **T041** Implement Task state transitions (TODO → IN_PROGRESS → DONE) in Task entity
- [ ] **T042** Add subtask hierarchy logic (max 1 level) to Task entity
- [ ] **T043** [P] Create domain events (TaskCreated, TaskAssigned, TaskStatusChanged) in `apps/suru/services/task-service/src/domain/events/`

### Task Repository & Use Cases

- [ ] **T044** Define TaskRepository interface in `apps/suru/services/task-service/src/domain/repositories/task-repository.ts`
- [ ] **T045** [P] Create CreateTaskUseCase in `apps/suru/services/task-service/src/application/use-cases/create-task.ts`
- [ ] **T046** [P] Create GetTaskUseCase in `apps/suru/services/task-service/src/application/use-cases/get-task.ts`
- [ ] **T047** [P] Create UpdateTaskUseCase with optimistic locking in `apps/suru/services/task-service/src/application/use-cases/update-task.ts`
- [ ] **T048** [P] Create AssignTaskUseCase in `apps/suru/services/task-service/src/application/use-cases/assign-task.ts`
- [ ] **T049** [P] Create DeleteTaskUseCase in `apps/suru/services/task-service/src/application/use-cases/delete-task.ts`
- [ ] **T050** [P] Create ListTasksUseCase with filtering/sorting in `apps/suru/services/task-service/src/application/use-cases/list-tasks.ts`

---

## Phase 3.4: Domain Layer - Team Service

### Team Aggregate (Parallel)

- [ ] **T051** [P] Create TeamId value object in `apps/suru/services/team-service/src/domain/value-objects/team-id.ts`
- [ ] **T052** [P] Create TeamName value object in `apps/suru/services/team-service/src/domain/value-objects/team-name.ts`
- [ ] **T053** [P] Create TeamRole enum (OWNER/ADMIN/MEMBER) in `apps/suru/services/team-service/src/domain/value-objects/team-role.ts`
- [ ] **T054** [P] Create TeamMember entity in `apps/suru/services/team-service/src/domain/entities/team-member.ts`
- [ ] **T055** Create Team entity (aggregate root) with invariants in `apps/suru/services/team-service/src/domain/entities/team.ts`
- [ ] **T056** [P] Create ProjectId value object in `apps/suru/services/team-service/src/domain/value-objects/project-id.ts`
- [ ] **T057** [P] Create ProjectName value object in `apps/suru/services/team-service/src/domain/value-objects/project-name.ts`
- [ ] **T058** Create Project entity in `apps/suru/services/team-service/src/domain/entities/project.ts`

### Team Repository & Use Cases (Parallel)

- [ ] **T059** Define TeamRepository interface in `apps/suru/services/team-service/src/domain/repositories/team-repository.ts`
- [ ] **T060** Define ProjectRepository interface in `apps/suru/services/team-service/src/domain/repositories/project-repository.ts`
- [ ] **T061** [P] Create CreateTeamUseCase in `apps/suru/services/team-service/src/application/use-cases/create-team.ts`
- [ ] **T062** [P] Create AddMemberUseCase in `apps/suru/services/team-service/src/application/use-cases/add-member.ts`
- [ ] **T063** [P] Create CreateProjectUseCase in `apps/suru/services/team-service/src/application/use-cases/create-project.ts`
- [ ] **T064** [P] Create ListProjectsUseCase in `apps/suru/services/team-service/src/application/use-cases/list-projects.ts`

---

## Phase 3.5: Domain Layer - Auth Service

### User Aggregate (Parallel)

- [ ] **T065** [P] Create UserId value object in `apps/suru/services/auth-service/src/domain/value-objects/user-id.ts`
- [ ] **T066** [P] Create Email value object with validation in `apps/suru/services/auth-service/src/domain/value-objects/email.ts`
- [ ] **T067** [P] Create OAuthProvider entity in `apps/suru/services/auth-service/src/domain/entities/oauth-provider.ts`
- [ ] **T068** Create User entity (aggregate root) in `apps/suru/services/auth-service/src/domain/entities/user.ts`

### Auth Repository & Use Cases (Parallel)

- [ ] **T069** Define UserRepository interface in `apps/suru/services/auth-service/src/domain/repositories/user-repository.ts`
- [ ] **T070** [P] Create InitiateOAuthUseCase (generate redirect URL) in `apps/suru/services/auth-service/src/application/use-cases/initiate-oauth.ts`
- [ ] **T071** [P] Create HandleOAuthCallbackUseCase (exchange code for tokens) in `apps/suru/services/auth-service/src/application/use-cases/handle-oauth-callback.ts`
- [ ] **T072** [P] Create GenerateJWTUseCase in `apps/suru/services/auth-service/src/application/use-cases/generate-jwt.ts`
- [ ] **T073** [P] Create ValidateJWTUseCase in `apps/suru/services/auth-service/src/application/use-cases/validate-jwt.ts`

---

## Phase 3.6: Domain Layer - Notification Service

### Notification Aggregate (Parallel)

- [ ] **T074** [P] Create NotificationId value object in `apps/suru/services/notification-service/src/domain/value-objects/notification-id.ts`
- [ ] **T075** [P] Create NotificationType enum in `apps/suru/services/notification-service/src/domain/value-objects/notification-type.ts`
- [ ] **T076** Create Notification entity in `apps/suru/services/notification-service/src/domain/entities/notification.ts`

### Notification Repository & Use Cases (Parallel)

- [ ] **T077** Define NotificationRepository interface in `apps/suru/services/notification-service/src/domain/repositories/notification-repository.ts`
- [ ] **T078** [P] Create CreateNotificationUseCase in `apps/suru/services/notification-service/src/application/use-cases/create-notification.ts`
- [ ] **T079** [P] Create ListNotificationsUseCase in `apps/suru/services/notification-service/src/application/use-cases/list-notifications.ts`
- [ ] **T080** [P] Create MarkAsReadUseCase in `apps/suru/services/notification-service/src/application/use-cases/mark-as-read.ts`

---

## Phase 3.7: Infrastructure Layer - Repositories

### Task Service Infrastructure (Parallel)

- [ ] **T081** [P] Implement PrismaTaskRepository in `apps/suru/services/task-service/src/infrastructure/repositories/prisma-task-repository.ts`
- [ ] **T082** [P] Add database indexes for task queries in Prisma schema (project_id, assignee_id, status, due_date)

### Team Service Infrastructure (Parallel)

- [ ] **T083** [P] Implement PrismaTeamRepository in `apps/suru/services/team-service/src/infrastructure/repositories/prisma-team-repository.ts`
- [ ] **T084** [P] Implement PrismaProjectRepository in `apps/suru/services/team-service/src/infrastructure/repositories/prisma-project-repository.ts`

### Auth Service Infrastructure (Parallel)

- [ ] **T085** [P] Implement PrismaUserRepository in `apps/suru/services/auth-service/src/infrastructure/repositories/prisma-user-repository.ts`
- [ ] **T086** [P] Integrate Passport.js OAuth strategies (Google, GitHub) in `apps/suru/services/auth-service/src/infrastructure/oauth/passport-config.ts`

### Notification Service Infrastructure (Parallel)

- [ ] **T087** [P] Implement PrismaNotificationRepository in `apps/suru/services/notification-service/src/infrastructure/repositories/prisma-notification-repository.ts`
- [ ] **T088** [P] Set up Web Push notification client in `apps/suru/services/notification-service/src/infrastructure/push/web-push-client.ts`
- [ ] **T089** [P] Set up FCM notification client in `apps/suru/services/notification-service/src/infrastructure/push/fcm-client.ts`

---

## Phase 3.8: gRPC Service Implementation

### Task Service gRPC Server

- [ ] **T090** Implement TaskService gRPC server in `apps/suru/services/task-service/src/presentation/grpc/task-service-server.ts`
- [ ] **T091** Wire up CreateTask handler with CreateTaskUseCase
- [ ] **T092** Wire up GetTask handler with GetTaskUseCase
- [ ] **T093** Wire up UpdateTask handler with UpdateTaskUseCase
- [ ] **T094** Wire up AssignTask handler with AssignTaskUseCase
- [ ] **T095** Implement WatchTasks streaming RPC with Valkey pub/sub

### Team Service gRPC Server

- [ ] **T096** Implement TeamService gRPC server in `apps/suru/services/team-service/src/presentation/grpc/team-service-server.ts`
- [ ] **T097** Wire up CreateTeam, CreateProject, AddMember handlers
- [ ] **T098** Add role-based authorization middleware for team operations

### Auth Service gRPC Server

- [ ] **T099** Implement AuthService gRPC server in `apps/suru/services/auth-service/src/presentation/grpc/auth-service-server.ts`
- [ ] **T100** Wire up InitiateOAuth, HandleOAuthCallback, ValidateToken handlers

### Notification Service gRPC Server

- [ ] **T101** Implement NotificationService gRPC server in `apps/suru/services/notification-service/src/presentation/grpc/notification-service-server.ts`
- [ ] **T102** Implement domain event subscriber for TaskAssigned in `apps/suru/services/notification-service/src/application/event-handlers/task-assigned-handler.ts`
- [ ] **T103** Implement due date reminder scheduler with cron in `apps/suru/services/notification-service/src/infrastructure/scheduler/reminder-scheduler.ts`

---

## Phase 3.9: Gateway Implementation

### Hono Gateway Setup

- [ ] **T104** Initialize Hono server in `apps/suru/gateway/src/server.ts`
- [ ] **T105** Create gRPC client connections to all services in `apps/suru/gateway/src/clients/`
- [ ] **T106** Implement JWT validation middleware in `apps/suru/gateway/src/middleware/jwt-auth.ts`
- [ ] **T107** Configure CORS middleware in `apps/suru/gateway/src/middleware/cors.ts`
- [ ] **T108** Add request logging middleware in `apps/suru/gateway/src/middleware/logger.ts`

### Hono RPC Endpoints

- [ ] **T109** Create Hono RPC route for task operations in `apps/suru/gateway/src/routes/tasks.ts`
- [ ] **T110** Create Hono RPC route for team operations in `apps/suru/gateway/src/routes/teams.ts`
- [ ] **T111** Create Hono RPC route for auth operations in `apps/suru/gateway/src/routes/auth.ts`
- [ ] **T112** Create Hono RPC route for notifications in `apps/suru/gateway/src/routes/notifications.ts`

### Real-time WebSocket

- [ ] **T113** Implement WebSocket handler for task updates in `apps/suru/gateway/src/websocket/task-updates.ts`
- [ ] **T114** Subscribe to Valkey pub/sub for broadcasting task events
- [ ] **T115** Add WebSocket authentication using JWT

---

## Phase 3.10: Frontend - Base Setup

### Vite + React Configuration

- [ ] **T116** Initialize Vite project in `apps/suru/web/` with React + TypeScript
- [ ] **T117** [P] Configure Tailwind CSS in `apps/suru/web/tailwind.config.js`
- [ ] **T118** [P] Set up shadcn/ui components in `apps/suru/web/src/components/ui/`
- [ ] **T119** [P] Configure React Router v6 in `apps/suru/web/src/routes/index.tsx`
- [ ] **T120** [P] Set up Vitest for frontend testing in `apps/suru/web/vitest.config.ts`

### State Management

- [ ] **T121** Create Zustand store for UI state (modals, filters) in `apps/suru/web/src/lib/stores/ui-store.ts`
- [ ] **T122** Configure Tanstack React Query client in `apps/suru/web/src/lib/query-client.ts`
- [ ] **T123** Create Hono RPC client wrapper in `apps/suru/web/src/lib/api/rpc-client.ts`

---

## Phase 3.11: Frontend - Features (Parallel Components)

### Authentication Feature

- [ ] **T124** [P] Create OAuth login page in `apps/suru/web/src/features/auth/pages/login.tsx`
- [ ] **T125** [P] Create OAuth callback handler in `apps/suru/web/src/features/auth/pages/callback.tsx`
- [ ] **T126** [P] Create auth React Query hooks in `apps/suru/web/src/features/auth/hooks/use-auth.ts`

### Tasks Feature

- [ ] **T127** [P] Create task board component (Kanban) in `apps/suru/web/src/features/tasks/components/task-board.tsx`
- [ ] **T128** [P] Create task card component in `apps/suru/web/src/features/tasks/components/task-card.tsx`
- [ ] **T129** [P] Create task detail modal in `apps/suru/web/src/features/tasks/components/task-detail-modal.tsx`
- [ ] **T130** [P] Create task create/edit form in `apps/suru/web/src/features/tasks/components/task-form.tsx`
- [ ] **T131** [P] Add drag-and-drop for status changes using dnd-kit in task-board.tsx
- [ ] **T132** [P] Create task React Query hooks (useCreateTask, useUpdateTask, etc.) in `apps/suru/web/src/features/tasks/hooks/`

### Teams Feature

- [ ] **T133** [P] Create team list page in `apps/suru/web/src/features/teams/pages/team-list.tsx`
- [ ] **T134** [P] Create team creation modal in `apps/suru/web/src/features/teams/components/create-team-modal.tsx`
- [ ] **T135** [P] Create team members list in `apps/suru/web/src/features/teams/components/team-members.tsx`
- [ ] **T136** [P] Create team React Query hooks in `apps/suru/web/src/features/teams/hooks/`

### Projects Feature

- [ ] **T137** [P] Create project list component in `apps/suru/web/src/features/projects/components/project-list.tsx`
- [ ] **T138** [P] Create project creation modal in `apps/suru/web/src/features/projects/components/create-project-modal.tsx`
- [ ] **T139** [P] Create project React Query hooks in `apps/suru/web/src/features/projects/hooks/`

### Notifications Feature

- [ ] **T140** [P] Create notification bell icon with unread count in `apps/suru/web/src/features/notifications/components/notification-bell.tsx`
- [ ] **T141** [P] Create notification dropdown list in `apps/suru/web/src/features/notifications/components/notification-list.tsx`
- [ ] **T142** [P] Create notification React Query hooks in `apps/suru/web/src/features/notifications/hooks/`
- [ ] **T143** Request browser push notification permissions on login

---

## Phase 3.12: Frontend - Real-time & Integration

### WebSocket Integration

- [ ] **T144** Create WebSocket client in `apps/suru/web/src/lib/websocket/client.ts`
- [ ] **T145** Connect WebSocket on authentication
- [ ] **T146** Listen for task update events and invalidate React Query cache
- [ ] **T147** Implement optimistic updates for task mutations

### Routing & Navigation

- [ ] **T148** Define all routes in React Router (/, /teams/:id, /projects/:id, /callback)
- [ ] **T149** Create protected route wrapper with auth check
- [ ] **T150** Add navigation sidebar with team/project switcher

---

## Phase 3.13: End-to-End & Performance Tests

### E2E Tests with Playwright (Parallel)

- [ ] **T151** [P] E2E test for OAuth login flow in `apps/suru/web/tests/e2e/auth-flow.spec.ts`
- [ ] **T152** [P] E2E test for creating team and project in `apps/suru/web/tests/e2e/team-project.spec.ts`
- [ ] **T153** [P] E2E test for task creation and drag-drop in `apps/suru/web/tests/e2e/task-management.spec.ts`
- [ ] **T154** [P] E2E test for real-time updates (two browser tabs) in `apps/suru/web/tests/e2e/realtime-sync.spec.ts`

### Performance Tests (Parallel)

- [ ] **T155** [P] Load test for task creation (1000 concurrent requests) using Artillery in `apps/suru/gateway/tests/performance/task-creation.yml`
- [ ] **T156** [P] Database query performance test (verify p95 <50ms) in `apps/suru/services/task-service/tests/performance/query-performance.test.ts`
- [ ] **T157** [P] Frontend bundle size check (<200KB gzipped) in `apps/suru/web/tests/bundle-size.test.ts`

---

## Phase 3.14: Polish & Documentation

### Unit Tests (Parallel)

- [ ] **T158** [P] Unit tests for Task entity invariants in `apps/suru/services/task-service/tests/unit/task-entity.test.ts`
- [ ] **T159** [P] Unit tests for value objects (TaskTitle, Priority, etc.) in `apps/suru/services/task-service/tests/unit/value-objects/`
- [ ] **T160** [P] Unit tests for Team entity invariants in `apps/suru/services/team-service/tests/unit/team-entity.test.ts`
- [ ] **T161** [P] Unit tests for JWT generation/validation in `apps/suru/services/auth-service/tests/unit/jwt.test.ts`

### Accessibility (Parallel)

- [ ] **T162** [P] Add ARIA labels to task board and cards
- [ ] **T163** [P] Implement keyboard navigation for task board (Tab, Enter, Escape, Arrow keys)
- [ ] **T164** [P] Run axe-core accessibility tests in E2E suite

### Documentation (Parallel)

- [ ] **T165** [P] Create API documentation from .proto files using protoc-gen-doc
- [ ] **T166** [P] Write deployment guide in `apps/suru/docs/deployment.md`
- [ ] **T167** [P] Update README with architecture diagram and setup instructions

### Code Quality

- [ ] **T168** Run Biome linter across all services and fix violations
- [ ] **T169** Generate test coverage report and verify ≥80%
- [ ] **T170** Run cyclomatic complexity check (max 10 per function)

---

## Dependencies

### Phase Dependencies
- Phase 3.1 (Setup) blocks all other phases
- Phase 3.2 (Contract Tests) must complete before 3.3-3.9
- Phases 3.3-3.6 (Domain layers) are parallel per service
- Phase 3.7 (Infrastructure) depends on 3.3-3.6
- Phase 3.8 (gRPC servers) depends on 3.7
- Phase 3.9 (Gateway) depends on 3.8
- Phase 3.10-3.12 (Frontend) can start after 3.9
- Phase 3.13 (E2E) depends on 3.12
- Phase 3.14 (Polish) can start after 3.13

### Key Blocking Tasks
- T007 (DB schema) blocks T081-T087 (Repositories)
- T011-T014 (Type generation) blocks T015-T027 (Contract tests)
- T040 (Task entity) blocks T044-T050 (Use cases)
- T055 (Team entity) blocks T059-T064 (Use cases)
- T090-T103 (gRPC servers) block T109-T112 (Gateway routes)
- T123 (RPC client) blocks T124-T143 (Frontend features)

---

## Parallel Execution Examples

### Contract Tests (14 tasks in parallel)
```bash
# Generate all proto types first
Task: "Generate TypeScript types from task-service.proto"
Task: "Generate TypeScript types from team-service.proto"
Task: "Generate TypeScript types from auth-service.proto"
Task: "Generate TypeScript types from notification-service.proto"

# Then run all contract tests simultaneously
Task: "Contract test for TaskService.CreateTask"
Task: "Contract test for TaskService.GetTask"
Task: "Contract test for TeamService.CreateTeam"
Task: "Contract test for AuthService.InitiateOAuth"
# ... all 13 contract tests
```

### Domain Layer - Value Objects (20+ tasks in parallel)
```bash
Task: "Create TaskId value object"
Task: "Create TaskTitle value object"
Task: "Create Priority enum value object"
Task: "Create TeamId value object"
Task: "Create UserId value object"
Task: "Create Email value object"
# ... all value objects across all services
```

### Frontend Components (15+ tasks in parallel)
```bash
Task: "Create task board component (Kanban)"
Task: "Create task card component"
Task: "Create team list page"
Task: "Create notification bell icon"
Task: "Create project list component"
# ... all independent components
```

---

## Notes

- **[P] tasks**: Different files, no dependencies, safe to parallelize
- **Sequential tasks**: Same file or clear dependencies
- **TDD**: Contract tests (T015-T033) MUST fail before implementation
- **Verification**: Run quickstart.md manual tests after Phase 3.12
- **Performance**: Artillery load tests at Phase 3.13
- **Coverage**: Verify 80% minimum at T169

---

## Validation Checklist

- [x] All contracts have corresponding tests (T015-T027)
- [x] All entities have model tasks (T034-T076)
- [x] All tests come before implementation (Phase 3.2 before 3.3)
- [x] Parallel tasks truly independent (checked [P] markers)
- [x] Each task specifies exact file path
- [x] No task modifies same file as another [P] task
- [x] Dependencies documented
- [x] Quickstart scenarios mapped to integration tests
- [x] Constitution requirements tracked (TDD, 80% coverage, <200ms p95)

---

**Total Tasks**: 170
**Parallel Opportunities**: ~80 tasks marked [P]
**Estimated Duration**: 12-16 weeks with team of 3-4 developers

**Next Step**: Execute tasks starting with Phase 3.1, following strict TDD workflow (tests first, then implementation).
