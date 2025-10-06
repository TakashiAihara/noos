# Data Model: Suru Task Management System

**Date**: 2025-10-05
**Feature**: 001-suru-is-a

## Domain-Driven Design Structure

### Bounded Contexts
1. **Task Context**: Task management, subtasks, assignments
2. **Team Context**: Teams, projects, memberships
3. **Auth Context**: Users, OAuth tokens, sessions
4. **Notification Context**: Notifications, preferences, delivery

---

## Entities & Value Objects

### Task Context

#### Task (Aggregate Root)
```typescript
interface Task {
  // Identity
  id: TaskId;              // Value Object: UUID

  // Core Attributes
  title: TaskTitle;        // Value Object: string (1-200 chars)
  description: TaskDescription; // Value Object: string (optional, max 2000 chars)
  status: TaskStatus;      // Value Object: enum (TODO, IN_PROGRESS, DONE)
  priority: Priority;      // Value Object: enum (LOW, MEDIUM, HIGH)
  dueDate: DueDate | null; // Value Object: Date (optional)

  // Relationships
  projectId: ProjectId;    // Reference to Project
  assigneeId: UserId | null; // Reference to User (optional)
  tags: Tag[];             // Collection of Value Objects

  // Hierarchy
  parentTaskId: TaskId | null; // Self-reference for subtasks
  subtasks: Task[];        // Child tasks (loaded separately)

  // Metadata
  createdBy: UserId;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  version: number;         // Optimistic locking
}
```

**Invariants**:
- Title must not be empty
- Subtasks cannot have subtasks (max 1 level deep)
- Assignee must be member of project's team
- Status transitions: TODO → IN_PROGRESS → DONE (can skip)

**State Transitions**:
```
[Created] → TODO → IN_PROGRESS → DONE
            ↑_________|_________|
              (can reopen)
```

#### Value Objects

```typescript
class TaskId extends ValueObject<string> {
  // UUID v4, immutable
}

class TaskTitle extends ValueObject<string> {
  validate() {
    if (length < 1 || length > 200) throw new Error();
  }
}

enum TaskStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  DONE = 'DONE'
}

enum Priority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH'
}

class Tag extends ValueObject<string> {
  // Lowercase, alphanumeric + hyphens, max 30 chars
}
```

---

### Team Context

#### Team (Aggregate Root)
```typescript
interface Team {
  id: TeamId;
  name: TeamName;          // Value Object: string (1-100 chars)

  // Relationships
  members: TeamMember[];   // Entity: UserId + Role
  projects: Project[];     // Entities owned by team

  // Metadata
  createdBy: UserId;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

#### TeamMember (Entity)
```typescript
interface TeamMember {
  userId: UserId;
  role: TeamRole;          // Value Object: enum (OWNER, ADMIN, MEMBER)
  joinedAt: Timestamp;
}

enum TeamRole {
  OWNER = 'OWNER',         // Full control
  ADMIN = 'ADMIN',         // Manage members, projects
  MEMBER = 'MEMBER'        // View, create tasks
}
```

#### Project (Entity)
```typescript
interface Project {
  id: ProjectId;
  name: ProjectName;       // Value Object: string (1-100 chars)
  description: string | null;

  // Relationships
  teamId: TeamId;
  tasks: Task[];           // Tasks in this project

  // Metadata
  createdBy: UserId;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  archived: boolean;
}
```

**Invariants**:
- Project name must be unique within team
- Archived projects cannot have new tasks
- At least one OWNER per team

---

### Auth Context

#### User (Aggregate Root)
```typescript
interface User {
  id: UserId;

  // Profile
  email: Email;            // Value Object: validated email
  displayName: string;
  avatarUrl: string | null;

  // OAuth
  oauthProviders: OAuthProvider[]; // Entity: provider + externalId

  // Metadata
  createdAt: Timestamp;
  lastLoginAt: Timestamp;
}
```

#### OAuthProvider (Entity)
```typescript
interface OAuthProvider {
  provider: ProviderType;  // enum: GOOGLE, GITHUB
  externalId: string;      // Provider's user ID
  accessToken: string;     // Encrypted
  refreshToken: string | null; // Encrypted
  expiresAt: Timestamp;
}

enum ProviderType {
  GOOGLE = 'GOOGLE',
  GITHUB = 'GITHUB'
}
```

---

### Notification Context

#### Notification (Aggregate Root)
```typescript
interface Notification {
  id: NotificationId;

  // Core
  type: NotificationType;  // Value Object: enum
  message: string;

  // Relationships
  userId: UserId;          // Recipient
  taskId: TaskId | null;   // Related task (optional)

  // State
  readAt: Timestamp | null;
  deliveredAt: Timestamp | null;

  // Metadata
  createdAt: Timestamp;
  scheduledFor: Timestamp | null; // For reminders
}

enum NotificationType {
  TASK_ASSIGNED = 'TASK_ASSIGNED',
  TASK_MENTIONED = 'TASK_MENTIONED',
  DUE_DATE_REMINDER = 'DUE_DATE_REMINDER',
  TASK_UPDATED = 'TASK_UPDATED'
}
```

---

## Relationships

### Entity Relationship Diagram
```
User (1) ──< (N) TeamMember (N) >── (1) Team
                                         |
                                         | (1)
                                         V
                                    (N) Project
                                         |
                                         | (1)
                                         V
                                    (N) Task
                                         |
                                         | (1)
                                         V
                                    (N) Subtask

User (1) ──< (N) OAuthProvider

User (1) ──< (N) Notification >── (0..1) Task
```

---

## Database Schema (PostgreSQL)

### Tables

```sql
-- Auth Context
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  display_name VARCHAR(100) NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_login_at TIMESTAMPTZ
);

CREATE TABLE oauth_providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  provider VARCHAR(20) NOT NULL,
  external_id VARCHAR(255) NOT NULL,
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  expires_at TIMESTAMPTZ,
  UNIQUE(provider, external_id)
);

-- Team Context
CREATE TABLE teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(team_id, user_id)
);

CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  archived BOOLEAN DEFAULT FALSE,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(team_id, name)
);

-- Task Context
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  parent_task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,

  title VARCHAR(200) NOT NULL,
  description TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'TODO',
  priority VARCHAR(20) NOT NULL DEFAULT 'MEDIUM',
  due_date DATE,

  assignee_id UUID REFERENCES users(id) ON DELETE SET NULL,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  version INT DEFAULT 1,

  CHECK (status IN ('TODO', 'IN_PROGRESS', 'DONE')),
  CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH'))
);

CREATE TABLE task_tags (
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  tag VARCHAR(30) NOT NULL,
  PRIMARY KEY (task_id, tag)
);

-- Notification Context
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  task_id UUID REFERENCES tasks(id) ON DELETE SET NULL,

  type VARCHAR(30) NOT NULL,
  message TEXT NOT NULL,

  read_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  scheduled_for TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  CHECK (type IN ('TASK_ASSIGNED', 'TASK_MENTIONED', 'DUE_DATE_REMINDER', 'TASK_UPDATED'))
);
```

### Indexes
```sql
-- Performance indexes
CREATE INDEX idx_tasks_project ON tasks(project_id);
CREATE INDEX idx_tasks_assignee ON tasks(assignee_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_due_date ON tasks(due_date) WHERE due_date IS NOT NULL;
CREATE INDEX idx_tasks_parent ON tasks(parent_task_id) WHERE parent_task_id IS NOT NULL;

CREATE INDEX idx_team_members_user ON team_members(user_id);
CREATE INDEX idx_team_members_team ON team_members(team_id);

CREATE INDEX idx_notifications_user_unread ON notifications(user_id, created_at)
  WHERE read_at IS NULL;
CREATE INDEX idx_notifications_scheduled ON notifications(scheduled_for)
  WHERE scheduled_for IS NOT NULL AND delivered_at IS NULL;
```

---

## Domain Events

### Task Events
```typescript
interface TaskCreated {
  taskId: TaskId;
  projectId: ProjectId;
  createdBy: UserId;
  timestamp: Timestamp;
}

interface TaskAssigned {
  taskId: TaskId;
  assigneeId: UserId;
  assignedBy: UserId;
  timestamp: Timestamp;
}

interface TaskStatusChanged {
  taskId: TaskId;
  oldStatus: TaskStatus;
  newStatus: TaskStatus;
  changedBy: UserId;
  timestamp: Timestamp;
}
```

### Team Events
```typescript
interface MemberAdded {
  teamId: TeamId;
  userId: UserId;
  role: TeamRole;
  addedBy: UserId;
  timestamp: Timestamp;
}
```

---

## Validation Rules

### Task
- Title: 1-200 characters, non-empty
- Description: Max 2000 characters
- Due date: Cannot be in the past (on creation)
- Tags: Max 10 per task, 1-30 chars each
- Subtasks: Max 1 level deep, max 50 per parent

### Team
- Name: 1-100 characters, unique per team
- Members: Min 1 OWNER, max 100 members

### Project
- Name: 1-100 characters, unique per team
- Archived projects: Read-only for tasks

---

## Consistency Boundaries

- **Task Aggregate**: Task + Subtasks (loaded together)
- **Team Aggregate**: Team + Members (loaded together)
- **Project**: Separate aggregate, references Team
- **Notification**: Independent aggregate

**Cross-aggregate references**: Use IDs only, no object references
