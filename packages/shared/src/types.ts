export type TriggerType = "MENTION" | "DM" | "CRON" | "HEARTBEAT" | "DISCOVERY" | "MANUAL";

export type RunStatus = "QUEUED" | "RUNNING" | "COMPLETED" | "FAILED" | "CANCELLED";

export type ToolType = "NATIVE" | "MCP" | "PIPEDREAM" | "CUSTOM";

export type ThreadStatus = "ACTIVE" | "WAITING" | "COMPLETED" | "STALE";

export interface LLMMessage {
	role: "system" | "user" | "assistant" | "tool";
	content: string;
}

export interface LLMResponse {
	content: string;
	inputTokens: number;
	outputTokens: number;
	model: string;
}

export interface LLMProvider {
	chat(params: {
		model: string;
		messages: LLMMessage[];
		maxTokens?: number;
	}): Promise<LLMResponse>;
}

export interface ToolDefinition {
	name: string;
	description: string;
	type: ToolType;
	schema: Record<string, unknown>;
}

export interface ToolResult {
	output: unknown;
	durationMs: number;
	error?: string;
}
