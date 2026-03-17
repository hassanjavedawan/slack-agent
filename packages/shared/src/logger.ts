import pino from "pino";

function buildTransport(): pino.TransportSingleOptions | pino.TransportMultiOptions | undefined {
	if (process.env.NODE_ENV === "development") {
		return { target: "pino-pretty", options: { colorize: true } };
	}

	if (process.env.BETTERSTACK_SOURCE_TOKEN) {
		return {
			targets: [
				{ target: "pino/file", options: { destination: 1 } },
				{
					target: "@logtail/pino",
					options: { sourceToken: process.env.BETTERSTACK_SOURCE_TOKEN },
				},
			],
		};
	}

	return undefined;
}

export function createLogger(name: string, level = "info") {
	return pino({
		name,
		level,
		transport: buildTransport(),
	});
}

export const logger = createLogger("openviktor", process.env.LOG_LEVEL ?? "info");

export type Logger = pino.Logger;
