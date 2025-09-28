# Noos - Monorepo + Microservices System

A modern monorepo architecture containing multiple interconnected systems built with TypeScript, Hono, and various cutting-edge technologies.

## Systems

### 🔄 Meguru - Graph Organizer
Knowledge graph and organization system for managing complex relationships and data structures.

### 📖 Yomu - RSS Reader
Modern RSS reader application with microservice architecture, featuring:
- User authentication and management
- Feed subscription and crawling
- Article management
- Real-time updates

### ✅ Suru - Task Management
Task management system for organizing and tracking work items.

## Architecture

```
noos/
├── apps/
│   ├── meguru/          # Graph organizer system
│   ├── yomu/            # RSS reader system
│   │   ├── gateway/     # API Gateway (Hono)
│   │   ├── web/         # Frontend application
│   │   └── services/    # Microservices
│   └── suru/            # Task management system
├── packages/
│   ├── common/          # Shared packages across all systems
│   ├── meguru/          # Meguru-specific packages
│   └── yomu/            # Yomu-specific packages
└── tooling/             # Build tools and configurations
```

## Tech Stack

- **Framework**: Hono (API), React (Frontend)
- **Language**: TypeScript
- **Database**: PostgreSQL with Prisma/Drizzle ORM
- **Cache**: Valkey (Redis-compatible)
- **Message Queue**: Apache Pulsar
- **Monorepo**: Turborepo
- **Package Manager**: pnpm

## Getting Started

### Prerequisites

- Node.js >= 22.14.0
- pnpm 10.15.0

### Installation

```bash
pnpm install
```

### Development

```bash
# Run all systems
pnpm all:dev

# Run specific system
pnpm meguru:dev
pnpm yomu:dev
pnpm suru:dev
```

### Build

```bash
pnpm build
```

### Testing

```bash
pnpm test
```

## Scripts

- `pnpm meguru:dev` - Start Meguru system in development mode
- `pnpm yomu:dev` - Start Yomu system in development mode
- `pnpm suru:dev` - Start Suru system in development mode
- `pnpm all:dev` - Start all systems in development mode
- `pnpm build` - Build all systems
- `pnpm test` - Run tests
- `pnpm lint` - Lint code
- `pnpm typecheck` - Type checking

## License

ISC