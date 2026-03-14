import type { PrismaClient } from "@openviktor/db";
import { type ThreadPhaseValue, ThreadPhase } from "@openviktor/shared";

const VALID_TRANSITIONS: ReadonlyMap<ThreadPhaseValue, readonly ThreadPhaseValue[]> = new Map([
	[ThreadPhase.IDLE, [ThreadPhase.TRIGGER]],
	[ThreadPhase.TRIGGER, [ThreadPhase.PROMPT_INJECTION]],
	[ThreadPhase.PROMPT_INJECTION, [ThreadPhase.THREAD_LOCK]],
	[ThreadPhase.THREAD_LOCK, [ThreadPhase.REASONING]],
	[ThreadPhase.REASONING, [ThreadPhase.TOOL_LOOP, ThreadPhase.DRAFT_GATE, ThreadPhase.COMPLETION]],
	[ThreadPhase.TOOL_LOOP, [ThreadPhase.REASONING, ThreadPhase.DRAFT_GATE, ThreadPhase.COMPLETION]],
	[ThreadPhase.DRAFT_GATE, [ThreadPhase.PROGRESS, ThreadPhase.COMPLETION]],
	[ThreadPhase.PROGRESS, [ThreadPhase.COMPLETION]],
	[ThreadPhase.COMPLETION, [ThreadPhase.IDLE]],
]);

const PHASE_NAMES: ReadonlyMap<ThreadPhaseValue, string> = new Map([
	[ThreadPhase.IDLE, "IDLE"],
	[ThreadPhase.TRIGGER, "TRIGGER"],
	[ThreadPhase.PROMPT_INJECTION, "PROMPT_INJECTION"],
	[ThreadPhase.THREAD_LOCK, "THREAD_LOCK"],
	[ThreadPhase.REASONING, "REASONING"],
	[ThreadPhase.TOOL_LOOP, "TOOL_LOOP"],
	[ThreadPhase.DRAFT_GATE, "DRAFT_GATE"],
	[ThreadPhase.PROGRESS, "PROGRESS"],
	[ThreadPhase.COMPLETION, "COMPLETION"],
]);

export function phaseName(phase: ThreadPhaseValue): string {
	return PHASE_NAMES.get(phase) ?? `UNKNOWN(${phase})`;
}

export function isValidTransition(from: ThreadPhaseValue, to: ThreadPhaseValue): boolean {
	const allowed = VALID_TRANSITIONS.get(from);
	return allowed !== undefined && allowed.includes(to);
}

export async function transitionPhase(
	prisma: PrismaClient,
	threadId: string,
	phase: ThreadPhaseValue,
): Promise<void> {
	await prisma.thread.update({
		where: { id: threadId },
		data: { phase },
	});
}
