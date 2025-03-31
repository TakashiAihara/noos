# CLAUDE.md - Project Guidelines

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