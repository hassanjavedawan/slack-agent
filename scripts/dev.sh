#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$REPO_ROOT"

export PATH="$HOME/.bun/bin:$PATH"

echo "=== OpenViktor Dev ==="
echo ""

# Check .env exists
if [ ! -f ".env" ]; then
  echo "Error: .env file not found. Run ./scripts/setup.sh first."
  exit 1
fi

# Start infrastructure if not running
echo "Ensuring PostgreSQL and Redis are running..."
docker compose -f docker/docker-compose.yml up -d postgres redis 2>&1 | grep -v "already allocated" || true

for i in $(seq 1 30); do
  if pg_isready -h localhost -p 5432 -U openviktor &> /dev/null 2>&1 || \
     docker compose -f docker/docker-compose.yml exec -T postgres pg_isready -U openviktor &> /dev/null 2>&1; then
    echo "Infrastructure ready."
    break
  fi
  if [ "$i" -eq 30 ]; then
    echo "Error: PostgreSQL not reachable on localhost:5432"
    exit 1
  fi
  sleep 1
done

echo ""
echo "Starting bot..."
echo "Press Ctrl+C to stop."
echo ""

cd apps/bot && exec bun --env-file=../../.env --watch src/index.ts
