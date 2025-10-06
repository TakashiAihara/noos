# Quickstart Guide: Suru Task Management System

**Purpose**: Manual validation of core user scenarios from the feature specification.

## Prerequisites
- All services running (gateway, task-service, team-service, auth-service, notification-service)
- PostgreSQL database migrated
- OAuth configured (Google/GitHub test app)
- Web frontend running on `http://localhost:5173`

---

## Scenario 1: User Registration & Authentication

**Given**: New user wants to access the system
**When**: User initiates OAuth flow
**Then**: User is authenticated and redirected to dashboard

### Steps:
1. Navigate to `http://localhost:5173`
2. Click "Sign in with Google" or "Sign in with GitHub"
3. Complete OAuth flow with test credentials
4. Verify redirect to `/dashboard`
5. Check user profile appears in top-right corner

**Expected Result**:
- User record created in database
- JWT tokens issued (access + refresh)
- User sees empty dashboard with "Create Team" button

---

## Scenario 2: Create Team and Project

**Given**: Authenticated user on dashboard
**When**: User creates a team and project
**Then**: Team and project are created successfully

### Steps:
1. Click "Create Team" button
2. Enter team name: "Test Team"
3. Click "Save"
4. Verify team appears in sidebar
5. Click "New Project" within the team
6. Enter project name: "Test Project"
7. Add description: "Initial test project"
8. Click "Create"

**Expected Result**:
- Team created with user as OWNER
- Project created under team
- Project visible in team's project list
- User redirected to project board (empty)

---

## Scenario 3: Create Task with Full Attributes

**Given**: User is viewing project board
**When**: User creates a task with all attributes
**Then**: Task is created and appears on board

### Steps:
1. Click "Add Task" button
2. Fill in task details:
   - Title: "Implement user authentication"
   - Description: "OAuth integration with Google and GitHub"
   - Status: TODO (default)
   - Priority: HIGH
   - Due Date: Tomorrow's date
   - Tags: "auth", "backend"
3. Click "Create Task"

**Expected Result**:
- Task appears in TODO column
- Task card shows all entered details
- Tags displayed as pills
- Priority indicated by color
- Due date shown

---

## Scenario 4: Add Subtask

**Given**: Task exists on the board
**When**: User adds a subtask
**Then**: Subtask is created and nested under parent

### Steps:
1. Click on the task created in Scenario 3
2. Task detail modal opens
3. Click "Add Subtask" button
4. Enter title: "Research OAuth providers"
5. Click "Add"
6. Repeat for second subtask: "Implement OAuth flow"

**Expected Result**:
- Both subtasks appear in task detail view
- Subtasks shown as checklist items
- Progress indicator updates (0/2 complete)

---

## Scenario 5: Assign Task to Team Member

**Given**: Multiple team members exist
**When**: User assigns a task
**Then**: Assignee receives notification

### Setup:
1. Add second user to team (via admin panel or direct DB insert for testing)

### Steps:
1. Open task detail modal
2. Click "Assignee" dropdown
3. Select team member
4. Click "Save"

**Expected Result**:
- Assignee's avatar appears on task card
- Notification sent to assignee (check notifications bell icon)
- Notification contains: "You were assigned to 'Implement user authentication'"

---

## Scenario 6: Update Task Status (Drag & Drop)

**Given**: Task in TODO column
**When**: User drags task to IN_PROGRESS
**Then**: Status updates with real-time sync

### Steps:
1. Drag task card from TODO column
2. Drop into IN_PROGRESS column
3. Open second browser tab (or incognito) logged in as different user
4. Observe task position in second tab

**Expected Result**:
- Task moves to IN_PROGRESS column
- Real-time update reflects in second browser tab (< 1s)
- WebSocket connection shows status change event
- Task status persisted in database

---

## Scenario 7: Real-time Cross-Platform Sync

**Given**: Task created on web
**When**: User opens mobile app
**Then**: Task visible with synchronized data

### Steps:
1. On web: Create new task "Test mobile sync"
2. On mobile (PWA or native app):
   - Open same project
   - Pull to refresh (if needed)
3. Verify task appears

**Expected Result**:
- Task visible on mobile within 1 second
- All attributes match (title, description, status, etc.)
- Real-time updates work bidirectionally

---

## Scenario 8: Task Filtering and Sorting

**Given**: Multiple tasks exist
**When**: User applies filters
**Then**: Only matching tasks displayed

### Steps:
1. Create tasks with different attributes:
   - Task 1: Priority HIGH, Tag "backend"
   - Task 2: Priority LOW, Tag "frontend"
   - Task 3: Priority HIGH, Tag "frontend"
2. Apply filter: Priority = HIGH
3. Verify only Task 1 and 3 visible
4. Apply filter: Tag = "frontend"
5. Verify only Task 3 visible (HIGH + frontend)
6. Change sort: Due Date (ascending)
7. Verify tasks ordered by due date

**Expected Result**:
- Filters applied immediately
- Query parameters in URL reflect filters
- Sort order persisted across page refreshes

---

## Scenario 9: Due Date Reminder Notification

**Given**: Task with due date in near future
**When**: Reminder time reached
**Then**: Push notification delivered

### Setup:
1. Configure notification scheduler to run every minute (for testing)
2. Create task with due date = 1 day from now

### Steps:
1. Wait for scheduler to run (check logs)
2. Check notifications bell icon
3. Check browser push notification (if permitted)

**Expected Result**:
- In-app notification: "Task 'X' is due tomorrow"
- Browser push notification appears (if enabled)
- Notification marked as delivered in database

---

## Scenario 10: Concurrent Edit Conflict Handling

**Given**: Two users editing same task
**When**: Both save simultaneously
**Then**: Optimistic lock prevents data loss

### Steps:
1. User A: Open task detail, change title
2. User B: Open same task, change description
3. User A: Click "Save" (success)
4. User B: Click "Save" (should fail with conflict)
5. User B: Reload task, see updated title
6. User B: Re-apply description change
7. User B: Save successfully

**Expected Result**:
- User B sees error: "Task was modified by another user"
- Version mismatch detected (optimistic locking)
- User B prompted to refresh
- No data loss occurs

---

## Scenario 11: Offline Behavior (Connection Loss)

**Given**: User has active connection
**When**: Network disconnected
**Then**: Appropriate error handling

### Steps:
1. Disconnect network (airplane mode or devtools offline)
2. Attempt to create task
3. Observe error message

**Expected Result**:
- Error displayed: "Unable to connect. Check your internet connection."
- No stale data shown (online-only requirement)
- Graceful degradation, no crashes

---

## Scenario 12: Team Member Management

**Given**: User is team OWNER
**When**: User adds/removes members
**Then**: Permissions enforced correctly

### Steps:
1. Go to Team Settings
2. Click "Invite Member"
3. Enter email: testuser@example.com
4. Select role: ADMIN
5. Click "Invite"
6. Verify invitation sent (check email or DB)
7. As new member: Accept invite
8. Verify member appears in team list
9. As OWNER: Change member role to MEMBER
10. As OWNER: Remove member

**Expected Result**:
- Only OWNER/ADMIN can invite members
- Role changes persist
- Removed members lose access to team projects

---

## Performance Validation

### API Response Times
Run these cURL commands and verify p95 < 200ms:

```bash
# Create task
curl -w "@curl-format.txt" -X POST http://localhost:3000/api/tasks \
  -H "Authorization: Bearer $JWT" \
  -d '{"project_id":"xxx","title":"Perf test"}'

# List tasks (100 tasks)
curl -w "@curl-format.txt" http://localhost:3000/api/tasks?project_id=xxx \
  -H "Authorization: Bearer $JWT"

# Update task
curl -w "@curl-format.txt" -X PUT http://localhost:3000/api/tasks/xxx \
  -H "Authorization: Bearer $JWT" \
  -d '{"status":"IN_PROGRESS"}'
```

**Expected**:
- Create: < 100ms
- List: < 150ms
- Update: < 80ms

### Database Query Performance
Check slow query log for queries > 50ms:

```sql
SELECT query, mean_exec_time
FROM pg_stat_statements
WHERE mean_exec_time > 50
ORDER BY mean_exec_time DESC;
```

**Expected**: No queries exceeding 50ms

---

## Security Validation

### JWT Token Validation
```bash
# Valid token should work
curl http://localhost:3000/api/tasks -H "Authorization: Bearer $VALID_JWT"
# → 200 OK

# Expired token should fail
curl http://localhost:3000/api/tasks -H "Authorization: Bearer $EXPIRED_JWT"
# → 401 Unauthorized

# Tampered token should fail
curl http://localhost:3000/api/tasks -H "Authorization: Bearer $TAMPERED_JWT"
# → 401 Unauthorized
```

### Authorization Checks
```bash
# User A tries to access User B's team's tasks
curl http://localhost:3000/api/tasks?project_id=USER_B_PROJECT \
  -H "Authorization: Bearer $USER_A_JWT"
# → 403 Forbidden
```

---

## Accessibility Check

### Keyboard Navigation
1. Tab through task board
2. Verify focus indicators visible
3. Press Enter on task card → Opens detail modal
4. Press Escape → Closes modal
5. Navigate dropdowns with arrow keys

### Screen Reader Test
1. Enable screen reader (NVDA/JAWS/VoiceOver)
2. Verify all interactive elements announced
3. Task cards include status + priority in label
4. Form labels properly associated

**Expected**: WCAG 2.1 AA compliance

---

## Test Data Cleanup

After manual testing:

```sql
-- Reset database (dev only!)
TRUNCATE tasks, task_tags, projects, teams, team_members, users, oauth_providers, notifications RESTART IDENTITY CASCADE;
```

---

## Success Criteria Checklist

- [ ] User can authenticate via OAuth (Google/GitHub)
- [ ] User can create teams and invite members
- [ ] User can create projects within teams
- [ ] User can create tasks with full attributes (title, description, status, priority, due date, tags, assignee, subtasks)
- [ ] User can assign tasks to team members
- [ ] Tasks synchronize in real-time across devices
- [ ] Push notifications delivered for assignments and reminders
- [ ] Filters and sorting work correctly
- [ ] API responses < 200ms p95
- [ ] Database queries < 50ms p95
- [ ] Security: JWT validation and authorization enforced
- [ ] Accessibility: Keyboard navigation and screen reader compatible
- [ ] Concurrent edits handled via optimistic locking
- [ ] Offline behavior shows appropriate errors

---

**Next Step**: Proceed to `/tasks` to generate implementation tasks based on these scenarios.
