import { describe, expect, it, vi } from "vitest";
import type { BotContext } from "./events.js";
import { registerEventHandlers } from "./events.js";

function makeApp() {
	return {
		event: vi.fn(),
	};
}

function makeContext(): BotContext {
	return {
		prisma: {} as never,
		runner: { run: vi.fn() } as never,
		logger: {
			info: vi.fn(),
			debug: vi.fn(),
			warn: vi.fn(),
			error: vi.fn(),
		} as never,
	};
}

describe("registerEventHandlers", () => {
	it("registers app_mention event handler", () => {
		const app = makeApp();
		const ctx = makeContext();

		registerEventHandlers(app as never, ctx);

		const calls = app.event.mock.calls.map((c: unknown[]) => c[0]);
		expect(calls).toContain("app_mention");
	});

	it("registers message event handler", () => {
		const app = makeApp();
		const ctx = makeContext();

		registerEventHandlers(app as never, ctx);

		const calls = app.event.mock.calls.map((c: unknown[]) => c[0]);
		expect(calls).toContain("message");
	});

	it("app_mention handler returns early without required context", async () => {
		const app = makeApp();
		const ctx = makeContext();

		registerEventHandlers(app as never, ctx);

		const mentionCall = app.event.mock.calls.find((c: unknown[]) => c[0] === "app_mention");
		expect(mentionCall).toBeDefined();
		const handler = mentionCall?.[1] as (args: Record<string, unknown>) => Promise<void>;

		await handler({
			event: { channel: "C123", user: "U456", text: "hello bot", ts: "123.456" },
			say: vi.fn(),
			context: { teamId: undefined, botUserId: undefined, botToken: undefined },
			client: {},
		});

		expect(ctx.logger.error).toHaveBeenCalled();
	});

	it("message handler ignores non-DM messages", async () => {
		const app = makeApp();
		const ctx = makeContext();

		registerEventHandlers(app as never, ctx);

		const messageCall = app.event.mock.calls.find((c: unknown[]) => c[0] === "message");
		const handler = messageCall?.[1] as (args: Record<string, unknown>) => Promise<void>;

		await handler({
			event: {
				channel: "C123",
				channel_type: "channel",
				user: "U456",
				text: "public message",
				ts: "123.456",
			},
			say: vi.fn(),
			context: {},
			client: {},
		});

		// Runner should not be called for non-DM messages
		expect((ctx.runner as unknown as { run: ReturnType<typeof vi.fn> }).run).not.toHaveBeenCalled();
	});

	it("message handler ignores messages without text", async () => {
		const app = makeApp();
		const ctx = makeContext();

		registerEventHandlers(app as never, ctx);

		const messageCall = app.event.mock.calls.find((c: unknown[]) => c[0] === "message");
		const handler = messageCall?.[1] as (args: Record<string, unknown>) => Promise<void>;

		await handler({
			event: {
				channel: "D789",
				channel_type: "im",
				user: "U456",
				ts: "123.456",
			},
			say: vi.fn(),
			context: {},
			client: {},
		});

		expect((ctx.runner as unknown as { run: ReturnType<typeof vi.fn> }).run).not.toHaveBeenCalled();
	});
});
