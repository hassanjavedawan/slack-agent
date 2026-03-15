import { describe, expect, it, vi } from "vitest";
import { type ConditionContext, createConditionHelpers, evaluateCondition } from "../condition.js";

function createMockLogger() {
	return {
		info: vi.fn(),
		warn: vi.fn(),
		error: vi.fn(),
		debug: vi.fn(),
		fatal: vi.fn(),
		trace: vi.fn(),
		child: vi.fn().mockReturnThis(),
		level: "info" as const,
		// biome-ignore lint/suspicious/noExplicitAny: test mock
	} as any;
}

function createMockContext(overrides: Partial<ConditionContext> = {}): ConditionContext {
	return {
		workspaceId: "ws-1",
		cronJobId: "cron-1",
		lastRunAt: new Date("2026-03-13T08:00:00Z"),
		...overrides,
	};
}

describe("evaluateCondition", () => {
	// biome-ignore lint/suspicious/noExplicitAny: test mock
	const mockPrisma = {} as any;

	it("returns true for a truthy script", async () => {
		const result = await evaluateCondition(
			"return true;",
			createMockContext(),
			mockPrisma,
			createMockLogger(),
		);
		expect(result).toBe(true);
	});

	it("returns false for a falsy script", async () => {
		const result = await evaluateCondition(
			"return false;",
			createMockContext(),
			mockPrisma,
			createMockLogger(),
		);
		expect(result).toBe(false);
	});

	it("has access to ctx with safe fields only", async () => {
		const result = await evaluateCondition(
			'return ctx.workspaceId === "ws-1" && ctx.prisma === undefined;',
			createMockContext(),
			mockPrisma,
			createMockLogger(),
		);
		expect(result).toBe(true);
	});

	it("has access to helpers", async () => {
		const result = await evaluateCondition(
			"return typeof helpers.hasNewSlackMessages === 'function';",
			createMockContext(),
			mockPrisma,
			createMockLogger(),
		);
		expect(result).toBe(true);
	});

	it("returns false and logs warning on error", async () => {
		const logger = createMockLogger();
		const result = await evaluateCondition(
			"throw new Error('test error');",
			createMockContext(),
			mockPrisma,
			logger,
		);
		expect(result).toBe(false);
		expect(logger.warn).toHaveBeenCalled();
	});

	it("returns false on timeout", async () => {
		const logger = createMockLogger();
		const result = await evaluateCondition(
			"return new Promise(() => {});",
			createMockContext(),
			mockPrisma,
			logger,
		);
		expect(result).toBe(false);
	}, 10_000);

	it("coerces non-boolean returns", async () => {
		const result = await evaluateCondition(
			"return 1;",
			createMockContext(),
			mockPrisma,
			createMockLogger(),
		);
		expect(result).toBe(true);

		const result2 = await evaluateCondition(
			"return 0;",
			createMockContext(),
			mockPrisma,
			createMockLogger(),
		);
		expect(result2).toBe(false);
	});
});

describe("createConditionHelpers", () => {
	it("hasNewSlackMessages queries messages since lastRunAt", async () => {
		const mockPrisma = {
			message: {
				findFirst: vi.fn().mockResolvedValue({ id: "msg-1" }),
			},
			// biome-ignore lint/suspicious/noExplicitAny: test mock
		} as any;

		const ctx = createMockContext();
		const helpers = createConditionHelpers(mockPrisma, ctx);
		const result = await helpers.hasNewSlackMessages();

		expect(result).toBe(true);
		expect(mockPrisma.message.findFirst).toHaveBeenCalledWith({
			where: {
				agentRun: { workspaceId: "ws-1" },
				role: "user",
				createdAt: { gt: ctx.lastRunAt },
			},
		});
	});

	it("hasNewSlackMessages returns false when no messages", async () => {
		const mockPrisma = {
			message: {
				findFirst: vi.fn().mockResolvedValue(null),
			},
			// biome-ignore lint/suspicious/noExplicitAny: test mock
		} as any;

		const helpers = createConditionHelpers(mockPrisma, createMockContext());
		const result = await helpers.hasNewSlackMessages();
		expect(result).toBe(false);
	});

	it("isWithinBudget returns true when under budget", async () => {
		const mockPrisma = {
			agentRun: {
				aggregate: vi.fn().mockResolvedValue({ _sum: { costCents: 50 } }),
			},
			// biome-ignore lint/suspicious/noExplicitAny: test mock
		} as any;

		const helpers = createConditionHelpers(mockPrisma, createMockContext());
		const result = await helpers.isWithinBudget({ maxMonthlyCents: 100 });
		expect(result).toBe(true);
	});

	it("isWithinBudget returns false when over budget", async () => {
		const mockPrisma = {
			agentRun: {
				aggregate: vi.fn().mockResolvedValue({ _sum: { costCents: 150 } }),
			},
			// biome-ignore lint/suspicious/noExplicitAny: test mock
		} as any;

		const helpers = createConditionHelpers(mockPrisma, createMockContext());
		const result = await helpers.isWithinBudget({ maxMonthlyCents: 100 });
		expect(result).toBe(false);
	});

	it("hasActiveThreads returns true when threads exist", async () => {
		const mockPrisma = {
			thread: {
				findFirst: vi.fn().mockResolvedValue({ id: "thread-1" }),
			},
			// biome-ignore lint/suspicious/noExplicitAny: test mock
		} as any;

		const helpers = createConditionHelpers(mockPrisma, createMockContext());
		const result = await helpers.hasActiveThreads();
		expect(result).toBe(true);
	});
});
