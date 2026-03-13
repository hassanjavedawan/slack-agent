import type { PrismaClient } from "@openviktor/db";
import type { Logger } from "@openviktor/shared";

const CONDITION_TIMEOUT_MS = 5_000;

export interface ConditionContext {
	workspaceId: string;
	cronJobId: string;
	lastRunAt: Date | null;
}

export interface ConditionHelpers {
	hasNewSlackMessages: (opts?: { since?: Date }) => Promise<boolean>;
	isWithinBudget: (opts: { maxMonthlyCents: number }) => Promise<boolean>;
	hasActiveThreads: () => Promise<boolean>;
}

export function createConditionHelpers(
	prisma: PrismaClient,
	ctx: ConditionContext,
): ConditionHelpers {
	return {
		async hasNewSlackMessages(opts) {
			const since = opts?.since ?? ctx.lastRunAt ?? new Date(Date.now() - 3 * 60 * 60 * 1000);
			const recentMessages = await prisma.message.findFirst({
				where: {
					agentRun: { workspaceId: ctx.workspaceId },
					role: "user",
					createdAt: { gt: since },
				},
			});
			return recentMessages !== null;
		},

		async isWithinBudget(opts) {
			const startOfMonth = new Date();
			startOfMonth.setUTCDate(1);
			startOfMonth.setUTCHours(0, 0, 0, 0);

			const result = await prisma.agentRun.aggregate({
				where: {
					workspaceId: ctx.workspaceId,
					createdAt: { gte: startOfMonth },
					status: "COMPLETED",
				},
				_sum: { costCents: true },
			});
			const totalSpent = result._sum.costCents ?? 0;
			return totalSpent < opts.maxMonthlyCents;
		},

		async hasActiveThreads() {
			const activeThread = await prisma.thread.findFirst({
				where: {
					workspaceId: ctx.workspaceId,
					status: "ACTIVE",
				},
			});
			return activeThread !== null;
		},
	};
}

export async function evaluateCondition(
	script: string,
	ctx: ConditionContext,
	prisma: PrismaClient,
	logger: Logger,
): Promise<boolean> {
	try {
		const helpers = createConditionHelpers(prisma, ctx);

		const fn = new Function(
			"ctx",
			"helpers",
			`"use strict"; return (async () => { ${script} })();`,
		);

		const sandboxedCtx = {
			workspaceId: ctx.workspaceId,
			cronJobId: ctx.cronJobId,
			lastRunAt: ctx.lastRunAt,
		};

		const result = await Promise.race([
			fn(sandboxedCtx, helpers),
			new Promise<never>((_, reject) =>
				setTimeout(() => reject(new Error("Condition script timeout")), CONDITION_TIMEOUT_MS),
			),
		]);

		return Boolean(result);
	} catch (error) {
		logger.warn(
			{ cronJobId: ctx.cronJobId, err: error },
			"Condition script failed, defaulting to skip",
		);
		return false;
	}
}
