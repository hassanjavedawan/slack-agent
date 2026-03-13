#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$REPO_ROOT"

echo "=== OpenViktor Modal Deploy ==="
echo ""

# ─── Check modal CLI ────────────────────────────────────
if ! command -v modal &>/dev/null; then
  echo "Error: modal CLI not found."
  echo "  Install: pip install modal"
  echo "  Auth:    modal setup"
  exit 1
fi

# ─── Check secret exists ────────────────────────────────
if ! modal secret list 2>/dev/null | grep -q "openviktor-tools"; then
  echo "Modal secret 'openviktor-tools' not found."
  echo ""
  read -rp "Enter a TOOL_TOKEN for authenticating requests: " token
  if [ -z "$token" ]; then
    echo "Error: token cannot be empty."
    exit 1
  fi
  modal secret create openviktor-tools "TOOL_TOKEN=$token"
  echo ""
fi

# ─── Deploy ──────────────────────────────────────────────
echo "Deploying to Modal..."
echo ""
modal deploy infra/modal/app.py

echo ""
echo "=== Deployment complete ==="
echo ""
echo "To use Modal as your tool backend, set in .env:"
echo "  TOOL_BACKEND=modal"
echo "  MODAL_ENDPOINT_URL=<endpoint URL printed above>"
echo "  MODAL_AUTH_TOKEN=<the TOOL_TOKEN you set in the modal secret>"
