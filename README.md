# BizFlow Enterprise

A monorepo containing the BizFlow Enterprise backend API and frontend UI.

## Project Structure

```
bizflow-enterprise/
├── bizflow-api/          # NestJS Backend
├── bizflow-ui/           # Angular Frontend
├── pnpm-workspace.yaml   # Monorepo workspace configuration
├── package.json          # Root package configuration
└── README.md             # This file
```

## Prerequisites

- Node.js >= 18.0.0
- pnpm >= 8.0.0

## Installation

Install dependencies for all packages:

```bash
pnpm install
```

## Available Scripts

### Backend (API)

```bash
# Start development server with watch mode
pnpm api:dev

# Build for production
pnpm api:build

# Run tests
pnpm api:test
```

### Frontend (UI)

```bash
# Start development server
pnpm ui:start

# Build for production
pnpm ui:build

# Run tests
pnpm ui:test
```

### Monorepo Commands

```bash
# Build all packages
pnpm build

# Run development servers in parallel
pnpm dev

# Lint all packages
pnpm lint

# Format all packages
pnpm format
```

## Working with Individual Packages

To run a command in a specific package, use the `-F` flag:

```bash
# Run specific package command
pnpm -F bizflow-api start:dev
pnpm -F bizflow-ui start
```

## Workspace Benefits

This monorepo structure provides:

- **Unified dependency management** - All dependencies managed at root level
- **Shared scripts** - Common commands available from root
- **Atomic commits** - Backend and frontend changes in single commit
- **Easy cross-package references** - Packages can reference each other
- **Simplified CI/CD** - Single repository to manage in GitHub

## Getting Started

1. Clone the repository
2. Install dependencies: `pnpm install`
3. For development:
   - Backend: `pnpm api:dev`
   - Frontend: `pnpm ui:start`

## License

UNLICENSED
