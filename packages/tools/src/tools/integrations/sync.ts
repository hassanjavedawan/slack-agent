import type { PrismaClient } from "@openviktor/db";
import type { PipedreamClient } from "@openviktor/integrations";
import type { ToolRegistry } from "../../registry.js";
import type { IntegrationSyncHandler } from "./management.js";
import { registerIntegrationTools, unregisterIntegrationTools } from "./pipedream-tools.js";

export function createIntegrationSyncHandler(
	registry: ToolRegistry,
	client: PipedreamClient,
	prisma: PrismaClient,
	skipPermissions: boolean,
): IntegrationSyncHandler {
	return {
		async syncWorkspace(workspaceId: string) {
			const externalUserId = `workspace_${workspaceId}`;
			const remoteAccounts = await client.listAccounts(externalUserId);

			const existingAccounts = await prisma.integrationAccount.findMany({
				where: { workspaceId, status: "ACTIVE" },
			});
			const existingSlugs = new Set(existingAccounts.map((a) => a.authProvisionId));

			const added: string[] = [];
			const removed: string[] = [];

			// Detect new accounts
			for (const remote of remoteAccounts) {
				const authProvisionId = remote.auth_provision_id ?? remote.id;
				if (existingSlugs.has(authProvisionId)) continue;

				const appSlug = remote.app?.name_slug;
				const appName = remote.app?.name;
				if (!appSlug || !appName) continue;

				const account = await prisma.integrationAccount.create({
					data: {
						workspaceId,
						provider: "pipedream",
						appSlug,
						appName,
						authProvisionId,
						externalUserId,
					},
				});

				const actions = await client.listActions({ app: appSlug, limit: 50 });

				await registerIntegrationTools(
					registry,
					client,
					prisma,
					{
						id: account.id,
						workspaceId,
						appSlug,
						appName,
						authProvisionId,
						externalUserId,
					},
					actions,
					skipPermissions,
				);

				added.push(appSlug);
			}

			// Detect removed accounts
			const remoteProvisionIds = new Set(remoteAccounts.map((r) => r.auth_provision_id ?? r.id));
			for (const existing of existingAccounts) {
				if (remoteProvisionIds.has(existing.authProvisionId)) continue;

				await prisma.integrationAccount.update({
					where: { id: existing.id },
					data: { status: "REVOKED" },
				});

				const removedTools = await unregisterIntegrationTools(
					registry,
					prisma,
					workspaceId,
					existing.appSlug,
				);
				if (removedTools.length > 0) {
					removed.push(existing.appSlug);
				}
			}

			return { added, removed };
		},

		async disconnectApp(workspaceId: string, appSlug: string) {
			const accounts = await prisma.integrationAccount.findMany({
				where: { workspaceId, appSlug, status: "ACTIVE" },
			});

			for (const account of accounts) {
				try {
					await client.deleteAccount(account.authProvisionId);
				} catch {
					// Account may already be removed on Pipedream side
				}
				await prisma.integrationAccount.update({
					where: { id: account.id },
					data: { status: "REVOKED" },
				});
			}

			const removed = await unregisterIntegrationTools(registry, prisma, workspaceId, appSlug);

			return { removed };
		},
	};
}
