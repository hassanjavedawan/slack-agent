import type { ToolResult } from "@openviktor/shared";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { type ToolExecutionContext, type ToolExecutor, ToolRegistry } from "../registry.js";

function makeCtx(overrides: Partial<ToolExecutionContext> = {}): ToolExecutionContext {
	return {
		workspaceId: "ws_test",
		workspaceDir: "/data/workspaces/ws_test",
		timeoutMs: 5_000,
		...overrides,
	};
}

const echoExecutor: ToolExecutor = async (args) => ({
	output: { echoed: args.message },
	durationMs: 0,
});

const failingExecutor: ToolExecutor = async () => {
	throw new Error("boom");
};

describe("ToolRegistry", () => {
	let registry: ToolRegistry;

	beforeEach(() => {
		registry = new ToolRegistry();
	});

	it("registers and checks tool existence", () => {
		registry.register(
			"echo",
			{ name: "echo", description: "Echo", input_schema: {} },
			echoExecutor,
		);
		expect(registry.has("echo")).toBe(true);
		expect(registry.has("nonexistent")).toBe(false);
	});

	it("returns definitions for all registered tools", () => {
		registry.register("a", { name: "a", description: "A", input_schema: {} }, echoExecutor);
		registry.register("b", { name: "b", description: "B", input_schema: {} }, echoExecutor);
		const defs = registry.getDefinitions();
		expect(defs).toHaveLength(2);
		expect(defs.map((d) => d.name)).toEqual(["a", "b"]);
	});

	it("executes a registered tool and returns result", async () => {
		registry.register(
			"echo",
			{ name: "echo", description: "Echo", input_schema: {} },
			echoExecutor,
		);
		const result = await registry.execute("echo", { message: "hello" }, makeCtx());
		expect(result.output).toEqual({ echoed: "hello" });
		expect(result.error).toBeUndefined();
		expect(result.durationMs).toBeGreaterThanOrEqual(0);
	});

	it("returns error for unknown tool", async () => {
		const result = await registry.execute("nonexistent", {}, makeCtx());
		expect(result.error).toBe("Unknown tool: nonexistent");
	});

	it("catches executor errors and returns them as ToolResult", async () => {
		registry.register(
			"fail",
			{ name: "fail", description: "Fail", input_schema: {} },
			failingExecutor,
		);
		const result = await registry.execute("fail", {}, makeCtx());
		expect(result.error).toBe("boom");
		expect(result.output).toBeNull();
	});

	it("opens circuit breaker after 3 consecutive failures", async () => {
		registry.register(
			"fail",
			{ name: "fail", description: "Fail", input_schema: {} },
			failingExecutor,
		);

		await registry.execute("fail", {}, makeCtx());
		await registry.execute("fail", {}, makeCtx());
		await registry.execute("fail", {}, makeCtx());

		const result = await registry.execute("fail", {}, makeCtx());
		expect(result.error).toContain("circuit breaker open");
	});

	it("resets circuit breaker on success", async () => {
		let shouldFail = true;
		const conditionalExecutor: ToolExecutor = async () => {
			if (shouldFail) throw new Error("fail");
			return { output: "ok", durationMs: 0 };
		};

		registry.register(
			"cond",
			{ name: "cond", description: "Cond", input_schema: {} },
			conditionalExecutor,
		);

		await registry.execute("cond", {}, makeCtx());
		await registry.execute("cond", {}, makeCtx());

		shouldFail = false;
		const successResult = await registry.execute("cond", {}, makeCtx());
		expect(successResult.error).toBeUndefined();

		shouldFail = true;
		await registry.execute("cond", {}, makeCtx());
		const result = await registry.execute("cond", {}, makeCtx());
		expect(result.error).toBe("fail");
	});

	it("resets circuit breaker manually", async () => {
		registry.register(
			"fail",
			{ name: "fail", description: "Fail", input_schema: {} },
			failingExecutor,
		);

		await registry.execute("fail", {}, makeCtx());
		await registry.execute("fail", {}, makeCtx());
		await registry.execute("fail", {}, makeCtx());

		registry.resetCircuitBreaker("fail");

		const result = await registry.execute("fail", {}, makeCtx());
		expect(result.error).toBe("boom");
	});

	it("enforces timeout on slow executors", async () => {
		const slowExecutor: ToolExecutor = async () => {
			await new Promise((resolve) => setTimeout(resolve, 5_000));
			return { output: "done", durationMs: 0 };
		};

		registry.register(
			"slow",
			{ name: "slow", description: "Slow", input_schema: {} },
			slowExecutor,
		);
		const result = await registry.execute("slow", {}, makeCtx({ timeoutMs: 50 }));
		expect(result.error).toContain("timed out");
	});
});
