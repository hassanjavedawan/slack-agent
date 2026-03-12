# OpenViktor

Open-source AI coworker for Slack. Self-hostable alternative to [getviktor.com](https://getviktor.com).

## What is OpenViktor?

OpenViktor is an autonomous AI agent that lives in your Slack workspace as a team member. It can:

- **Respond to mentions and DMs** with contextually relevant, LLM-powered responses
- **Learn over time** by accumulating knowledge from your team's interactions
- **Execute tasks** using a extensible tool system (native tools, MCP protocol)
- **Monitor proactively** via scheduled heartbeats and workflow discovery
- **Integrate** with GitHub, Linear, and other tools your team uses

## Quick Start

### Prerequisites

- [Bun](https://bun.sh) >= 1.2
- [Docker](https://docs.docker.com/get-docker/) and Docker Compose
- A [Slack app](https://api.slack.com/apps) with Socket Mode enabled
- An [Anthropic API key](https://console.anthropic.com/)

### Setup

```bash
# Clone the repo
git clone https://github.com/zggf-zggf/openviktor.git
cd openviktor

# Run the setup script
./scripts/setup.sh

# Or manually:
bun install
cp docker/.env.example .env
# Edit .env with your Slack and Anthropic credentials
docker compose -f docker/docker-compose.yml up -d
bun run db:generate
bun run db:migrate
bun run dev
```

### Self-Hosting

See [docs/self-hosting.md](docs/self-hosting.md) for detailed self-hosting instructions.

## Architecture

OpenViktor is a TypeScript monorepo built with Bun and Turborepo:

```
openviktor/
├── apps/
│   ├── bot/              # Slack bot + agent runtime
│   └── web/              # Admin dashboard (Phase 7)
├── packages/
│   ├── db/               # PostgreSQL schema (Prisma)
│   ├── shared/           # Types, config, logger
│   ├── tools/            # Tool registry + executors
│   └── integrations/     # External service clients
└── docker/               # Docker Compose for self-hosting
```

### Tech Stack

| Component | Technology |
|-----------|-----------|
| Runtime | Bun |
| Language | TypeScript (strict) |
| Database | PostgreSQL 16 + Prisma |
| Cache | Redis 7 (optional) |
| LLM | Claude (primary), GPT/Gemini (fallback) |
| Slack | Bolt SDK (Socket Mode) |
| Build | Turborepo |
| Linting | Biome |
| Testing | Vitest + Playwright |
| Deployment | Docker Compose |

## Development

```bash
# Install dependencies
bun install

# Start infrastructure
docker compose -f docker/docker-compose.yml up -d

# Generate Prisma client
bun run db:generate

# Run migrations
bun run db:migrate

# Start dev server
bun run dev

# Run tests
bun run test

# Lint
bun run lint

# Type check
bun run typecheck
```

## Development Phases

| Phase | Status | Description |
|-------|--------|-------------|
| 0 | Current | Repository foundation, CI, Docker, tooling |
| 1 | Next | Slack mention → LLM → thread reply |
| 2 | Planned | Tool gateway + native tools |
| 3 | Planned | Memory/learning system |
| 4 | Planned | Thread orchestrator + concurrency |
| 5 | Planned | Cron, heartbeat, workflow discovery |
| 6 | Planned | MCP + external integrations |
| 7 | Planned | Admin web dashboard |
| 8 | Planned | Hardening + production readiness |

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on how to contribute.

## License

[MIT](LICENSE)
