# CLAUDE.md - Project Guidelines

## Workflow Guidelines

### Phase Completion Protocol
**IMPORTANT**: After completing each implementation phase, you MUST:
1. Document technical insights and learnings in the corresponding GitHub Issue
2. Include: implementation details, technical challenges, solutions, test results
3. Format: Add as a comment to the Epic issue for that phase
4. Commit the completed work with a descriptive commit message

Example comment structure:
```markdown
## Phase X.X 実装完了 - [Phase Name]

### 実装内容
- ✅ [What was implemented]

### 技術的知見
#### [Problem/Challenge encountered]
**問題**: [Description]
**解決策**: [Solution with code examples]

### テスト結果
[Test summary]

### 次のステップ
[Next phase]
```

### Ad-hoc Improvements and Bug Fixes
**IMPORTANT**: When user requests improvements or fixes outside of planned Phase requirements:
1. Create a new GitHub Issue for the requested work
2. Include: clear description, acceptance criteria, affected components
3. Add appropriate labels (e.g., `enhancement`, `bug`, `refactor`)
4. Link to related Phase Epic if applicable
5. Implement the changes and reference the issue number in commit messages
6. Close the issue when work is completed

This ensures all work is tracked and documented, even for unplanned tasks.

## Build and Test Commands
- Install dependencies: `pnpm install`
- Run tests: `pnpm test`
- Run a single test: `pnpm test -- path/to/testfile.test.js`
- Lint code: `pnpm lint`
- Type check: `pnpm typecheck`
- Build project: `pnpm build`

## Code Style Guidelines
- Use TypeScript for type safety
- Format with Prettier
- Follow ESLint rules
- Use camelCase for variables and functions
- Use PascalCase for classes and interfaces
- Use kebab-case for file names
- Prefer async/await over raw promises
- Use named exports over default exports
- Group imports: built-in, external, internal
- Handle errors with try/catch blocks
- Use strict null checking
- Document public APIs with JSDoc comments
