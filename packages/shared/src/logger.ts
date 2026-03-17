import { Writable } from "node:stream";
import { Logtail } from "@logtail/node";
import pino from "pino";

let logtail: Logtail | undefined;

if (process.env.BETTERSTACK_SOURCE_TOKEN) {
	logtail = new Logtail(process.env.BETTERSTACK_SOURCE_TOKEN);
}

function createDestination(): pino.DestinationStream | undefined {
	if (!logtail) return undefined;

	return new Writable({
		write(chunk: Buffer, _encoding, callback) {
			process.stdout.write(chunk);
			try {
				const parsed = JSON.parse(chunk.toString());
				const level = pino.levels.labels[parsed.level] ?? "info";
				const method = level === "fatal" ? "error" : level;
				if (method === "info") logtail?.info(parsed.msg ?? "", parsed);
				else if (method === "warn") logtail?.warn(parsed.msg ?? "", parsed);
				else if (method === "error") logtail?.error(parsed.msg ?? "", parsed);
				else if (method === "debug") logtail?.debug(parsed.msg ?? "", parsed);
			} catch {}
			callback();
		},
	});
}

export function createLogger(name: string, level = "info") {
	const dest = createDestination();

	if (dest) {
		return pino({ name, level }, dest);
	}

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
