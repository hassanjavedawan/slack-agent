import pino from "pino";

const bsToken = process.env.BETTERSTACK_SOURCE_TOKEN;
const bsHost = process.env.BETTERSTACK_INGESTING_HOST || "s2301999.eu-fsn-3.betterstackdata.com";

const buffer: string[] = [];
let timer: ReturnType<typeof setTimeout> | null = null;

function flushToBetterStack() {
	if (!bsToken || buffer.length === 0) return;
	const batch = buffer.splice(0);
	timer = null;
	fetch(`https://${bsHost}`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${bsToken}`,
		},
		body: `[${batch.join(",")}]`,
	}).catch(() => {});
}

function sendToBetterStack(line: string) {
	buffer.push(line);
	if (!timer) {
		timer = setTimeout(flushToBetterStack, 1000);
	}
	if (buffer.length >= 50) {
		flushToBetterStack();
	}
}

export function createLogger(name: string, level = "info") {
	if (process.env.NODE_ENV === "development") {
		return pino({ name, level, transport: { target: "pino-pretty", options: { colorize: true } } });
	}

	if (bsToken) {
		const dest = new (require("node:stream").Writable)({
			write(chunk: Buffer, _enc: string, cb: () => void) {
				const line = chunk.toString().trim();
				process.stdout.write(chunk);
				if (line) sendToBetterStack(line);
				cb();
			},
		});
		return pino({ name, level }, dest);
	}

	return pino({ name, level });
}

export const logger = createLogger("openviktor", process.env.LOG_LEVEL ?? "info");

export type Logger = pino.Logger;
