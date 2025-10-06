# CLAUDE.md - Project Guidelines

## Workflow Guidelines

### Branch and Issue Management
**IMPORTANT**: For ALL development work, you MUST follow this workflow:

1. **Create GitHub Issue First**
   - Always create a GitHub Issue before starting any work
   - Include clear description, acceptance criteria, and affected components
   - Add appropriate labels (e.g., `enhancement`, `bug`, `feature`, `refactor`)
   - For Phase work, link to the corresponding Epic issue

2. **Create Branch from Issue**
   - Use `gh issue develop <issue-number> --checkout` to create a branch linked to the issue
   - This automatically links the branch to the issue for better traceability
   - Branch naming will follow GitHub's convention: `<issue-number>-<issue-title-slug>`
   - Never create branches manually without linking to an issue

3. **Work on the Feature/Fix**
   - Make commits with clear, descriptive messages
   - Reference the issue number in commit messages when relevant

4. **Create Pull Request**
   - Always create a PR for code review - never push directly to main
   - Use `gh pr create` with descriptive title and body
   - Link to the related issue(s) with "Closes #<issue-number>"
   - Ensure PR description includes implementation details and test results

5. **Verify CI and Merge**
   - Wait for all CI checks to pass
   - Fix any CI failures before requesting review
   - Merge only after CI is green
   - Delete the branch after merging

**Example workflow:**
```bash
# 1. Create issue
gh issue create --title "Add user authentication" --body "..."

# 2. Create branch from issue
gh issue develop 123 --checkout

# 3. Make changes and commit
git add .
git commit -m "Implement OAuth2 authentication"

# 4. Push and create PR
git push -u origin 123-add-user-authentication
gh pr create --title "..." --body "Closes #123"

# 5. Wait for CI, then merge
gh pr merge --squash --delete-branch
```

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

### Pull Request Requirements
**IMPORTANT**: When creating a pull request, you MUST:
1. Verify all CI checks pass before marking PR as ready
2. Check the following on GitHub Actions:
   - ✅ Lint check (biome lint)
   - ✅ Format check (biome format)
   - ✅ Type check (TypeScript compilation)
3. If CI fails, fix the issues and push again
4. Never merge a PR with failing CI checks
5. Document any CI-related fixes in the PR description

This ensures code quality and prevents breaking changes from being merged.

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
