# Directories

```
.
├── apps                  # Base application workspaces
│   └── core              # Core domain (back-end)
│       └── graphql-organizer  # BFF GraphQL(Yoga)
│           ├── src           # Main application source code
│           │   └── utility   # Utility modules
│           │       ├── Config      # Configuration utilities
│           │       └── HealthCheck # Health check utilities
│           └── test           # Unit and integration tests
│
├── packages               # Shared codes and database implementation
│   └── shared             # Shared code modules
│       └── types          # Shared TypeScript types
│
├── testing                # Browser (E2E) testing and manual testing
│   └── api               # Bruno API request collection
│
└── tooling                # Tool settings for development
    └── tsconfig         # Shared TypeScript configurations
```
