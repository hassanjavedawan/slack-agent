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
		headers: { "Content-Type": "application/json", Authorization: `Bearer ${bsToken}` },
		body: `[${batch.join(",")}]`,
	}).catch(() => {});
}

function sendToBetterStack(line: string) {
	buffer.push(line);
	if (!timer) timer = setTimeout(flushToBetterStack, 1000);
	if (buffer.length >= 50) flushToBetterStack();
}

if (bsToken && process.env.NODE_ENV !== "development") {
	const origWrite = process.stdout.write.bind(process.stdout);
	process.stdout.write = ((chunk: Uint8Array | string, ...args: unknown[]): boolean => {
		const str = typeof chunk === "string" ? chunk : Buffer.from(chunk).toString();
		const trimmed = str.trim();
		if (trimmed.startsWith("{") && trimmed.includes('"level"')) {
			sendToBetterStack(trimmed);
		}
		return (origWrite as CallableFunction)(chunk, ...args);
	}) as typeof process.stdout.write;
}

export function createLogger(name: string, level = "info") {
	return pino({
		name,
		level,
		transport:
			process.env.NODE_ENV === "development"
				? { target: "pino-pretty", options: { colorize: true } }
				: undefined,
	});
}

export const logger = createLogger("openviktor", process.env.LOG_LEVEL ?? "info");

export type Logger = pino.Logger;
