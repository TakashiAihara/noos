import { defineWorkspace } from 'vitest/config';

export default defineWorkspace([
  // Suru microservices
  'apps/suru/gateway',
  'apps/suru/services/task-service',
  'apps/suru/services/team-service',
  'apps/suru/services/auth-service',
  'apps/suru/services/notification-service',
  'apps/suru/web',

  // Suru packages
  'packages/suru/common/types',
  'packages/suru/common/utils',

  // Other apps (existing)
  'apps/meguru',
  'apps/yomu',
]);
