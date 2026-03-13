import { prisma } from "@openviktor/db";
import { createLogger, loadConfig } from "@openviktor/shared";
import { ToolGatewayClient, createNativeRegistry } from "@openviktor/tools";
import { LLMGateway } from "./agent/gateway.js";
import { AgentRunner } from "./agent/runner.js";
import {
	createBotFilter,
	createDeduplicator,
	createSlackApp,
	registerEventHandlers,
	startSlackApp,
} from "./slack/index.js";
import { createToolGateway, registerWorkspaceToken } from "./tool-gateway/server.js";

const logger = createLogger("bot");

async function main(): Promise<void> {
	const config = loadConfig();

	await prisma.$connect();
	logger.info("Database connected");

	const registry = createNativeRegistry();
	const gatewayDeps = {
		registry,
		logger: createLogger("tool-gateway"),
		defaultTimeoutMs: config.TOOL_TIMEOUT_MS,
	};
	const gateway = createToolGateway(gatewayDeps);

	const gatewayPort = config.TOOL_GATEWAY_PORT;
	const gatewayServer = Bun.serve({
		port: gatewayPort,
		fetch: gateway.fetch,
	});
	logger.info(
		{ port: gatewayServer.port, tools: registry.getDefinitions().map((t) => t.name) },
		"Tool gateway started",
	);

	const gatewayClient = new ToolGatewayClient({
		baseUrl: `http://localhost:${gatewayServer.port}`,
		token: "local",
		timeoutMs: config.TOOL_TIMEOUT_MS,
	});
	registerWorkspaceToken("local", "default");

	const llm = new LLMGateway(config);
	const runner = new AgentRunner(prisma, llm, createLogger("agent-runner"), {
		client: gatewayClient,
		tools: registry.getDefinitions(),
	});

	const app = createSlackApp(config);

	app.use(createDeduplicator());
	app.use(createBotFilter(logger));

	registerEventHandlers(app, { prisma, runner, logger });

	await startSlackApp(app);

	const shutdown = async () => {
		logger.info("Shutting down");
		gatewayServer.stop();
		await app.stop();
		await prisma.$disconnect();
		process.exit(0);
	};

	process.on("SIGTERM", shutdown);
	process.on("SIGINT", shutdown);
}

main().catch((err) => {
	logger.error({ err }, "Fatal error during startup");
	process.exit(1);
});
