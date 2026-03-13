"""
OpenViktor Modal.com tool execution backend.

Deploys a web endpoint that receives tool execution requests and runs them
inside a Debian + Bun container with a persistent workspace volume.

Usage:
    modal deploy infra/modal/app.py

Environment variables (set via `modal secret`):
    TOOL_TOKEN - Bearer token for authenticating requests from the bot
"""

import json
import subprocess

import modal

app = modal.App("openviktor-tools")

volume = modal.Volume.from_name("openviktor-workspaces", create_if_missing=True)

image = (
    modal.Image.from_registry("oven/bun:1-debian")
    .apt_install("ripgrep")
    .copy_local_dir("../../packages/tools", "/app/packages/tools")
    .copy_local_dir("../../packages/shared", "/app/packages/shared")
    .copy_local_file("../../package.json", "/app/package.json")
    .copy_local_file("../../bun.lock", "/app/bun.lock")
    .copy_local_file("../../tsconfig.json", "/app/tsconfig.json")
    .copy_local_dir("../../infra/modal/runner", "/app/infra/modal/runner")
    .run_commands(
        "cd /app && bun install --frozen-lockfile",
    )
)


@app.function(
    image=image,
    volumes={"/data/workspaces": volume},
    timeout=660,
    secrets=[modal.Secret.from_name("openviktor-tools")],
)
@modal.web_endpoint(method="POST")
def execute(request: dict) -> dict:
    """Execute a tool in an isolated Modal container."""
    import os

    auth_token = os.environ.get("TOOL_TOKEN", "")
    request_token = request.get("auth_token", "")
    if auth_token and request_token != auth_token:
        return {"error": "Unauthorized"}

    tool_name = request.get("tool_name")
    arguments = request.get("arguments", {})
    workspace_id = request.get("workspace_id", "default")
    timeout_ms = request.get("timeout_ms", 600_000)

    if not tool_name:
        return {"error": "Missing tool_name"}

    timeout_s = min(timeout_ms / 1000, 600)

    try:
        result = subprocess.run(
            [
                "bun",
                "run",
                "/app/infra/modal/runner/execute.ts",
                json.dumps(
                    {
                        "tool_name": tool_name,
                        "arguments": arguments,
                        "workspace_id": workspace_id,
                        "timeout_ms": timeout_ms,
                    }
                ),
            ],
            capture_output=True,
            text=True,
            timeout=timeout_s,
            cwd="/app",
        )

        if result.returncode != 0:
            stderr = result.stderr.strip()
            return {"error": f"Tool execution failed: {stderr or 'unknown error'}"}

        output = result.stdout.strip()
        if not output:
            return {"error": "Tool returned no output"}

        return json.loads(output)

    except subprocess.TimeoutExpired:
        return {"error": f"Tool '{tool_name}' timed out after {timeout_s}s"}
    except json.JSONDecodeError:
        return {"error": f"Invalid JSON from tool runner: {result.stdout[:500]}"}
    except Exception as e:
        return {"error": f"Unexpected error: {str(e)}"}
