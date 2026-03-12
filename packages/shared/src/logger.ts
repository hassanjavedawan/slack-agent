import pino from "pino";

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
