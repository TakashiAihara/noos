# GitHub Copilot Instructions for Noos Project

This document provides guidance for GitHub Copilot when working with the Noos project.

## Project Overview

Noos is a task management system with a microservices architecture:
- Monorepo structure managed by PNPM workspaces
- Database layer using Dgraph and CockroachDB
- Backend services built with NestJS
- Frontend built with Next.js using tRPC for type-safe API calls
- GraphQL Yoga as a Core BFF
- All components use TypeScript with strict type checking

## Architecture

The system follows a clean microservices architecture:
- **Client Side**: Frontend (Next.js) and AppRouter (tRPC)
- **Core Components**:
  - GraphQL Yoga BFF
  - Worker (NestJS)
  - GraphDB (Dgraph)
  - RDBMS (CockroachDB)
  - Blob Storage (S3-compatible)

## Key Files and Their Purpose

### Frontend (`apps/user/web`)
- Next.js application with tRPC integration

## Code Style Guidelines

Follow these conventions when generating code:
- Use TypeScript with strict type checking
- Format with Biome (configuration in `biome.json`)
- Use camelCase for variables and functions
- Use PascalCase for classes and interfaces
- Use kebab-case for file names
- Prefer async/await over raw promises
- Use named exports over default exports
- Group imports: built-in, external, internal
- Handle errors with try/catch blocks
- Use strict null checking

## Common Workflows

### Frontend Components
1. Create components following Next.js best practices
2. Use tRPC hooks for data fetching (`api.*.useQuery()`, etc.)
3. Implement proper error handling and loading states
