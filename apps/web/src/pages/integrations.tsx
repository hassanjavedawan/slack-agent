import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Badge } from "../components/ui/badge";
import { Card } from "../components/ui/card";
import { EmptyState } from "../components/ui/empty-state";
import { connectIntegration, disconnectIntegration, getIntegrations } from "../lib/api";

export function IntegrationsPage() {
	const queryClient = useQueryClient();
	const { data, isLoading, error } = useQuery({
		queryKey: ["integrations"],
		queryFn: getIntegrations,
	});

	const connect = useMutation({
		mutationFn: (slug: string) => connectIntegration(slug),
		onSuccess: (result) => {
			window.open(result.connectUrl, "_blank");
		},
	});

	const disconnect = useMutation({
		mutationFn: (slug: string) => disconnectIntegration(slug),
		onSuccess: () => queryClient.invalidateQueries({ queryKey: ["integrations"] }),
	});

	if (isLoading) {
		return (
			<div className="space-y-6">
				<div className="h-8 w-32 animate-pulse rounded bg-slate-200" />
				<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
					{["i1", "i2", "i3"].map((key) => (
						<div
							key={key}
							className="h-40 animate-pulse rounded-xl border border-slate-200 bg-white"
						/>
					))}
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
				Failed to load integrations: {(error as Error).message}
			</div>
		);
	}

	if (!data) return null;

	return (
		<div className="space-y-6">
			<h1 className="text-2xl font-bold text-slate-900">Integrations</h1>

			{data.apps.length === 0 ? (
				<Card>
					<EmptyState message="No integrations available" />
				</Card>
			) : (
				<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
					{data.apps.map((app) => {
						const connected = data.connectedSlugs.includes(app.slug);
						const toolCount = data.toolCounts[app.slug] ?? 0;
						return (
							<Card key={app.slug}>
								<div className="flex items-start gap-3">
									{app.imgSrc && (
										<img src={app.imgSrc} alt={app.name} className="h-10 w-10 rounded-lg" />
									)}
									<div className="flex-1">
										<div className="flex items-center gap-2">
											<h3 className="text-sm font-semibold text-slate-900">{app.name}</h3>
											{connected && (
												<Badge className="bg-emerald-100 text-emerald-800">Connected</Badge>
											)}
										</div>
										<p className="mt-1 line-clamp-2 text-xs text-slate-500">{app.description}</p>
										{toolCount > 0 && (
											<p className="mt-1 text-xs text-slate-400">{toolCount} tools</p>
										)}
									</div>
								</div>
								<div className="mt-4">
									{connected ? (
										<button
											type="button"
											onClick={() => disconnect.mutate(app.slug)}
											disabled={disconnect.isPending}
											className="rounded-lg border border-red-200 px-3 py-1.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50"
										>
											Disconnect
										</button>
									) : (
										<button
											type="button"
											onClick={() => connect.mutate(app.slug)}
											disabled={connect.isPending}
											className="rounded-lg bg-primary-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-primary-700 disabled:opacity-50"
										>
											Connect
										</button>
									)}
								</div>
							</Card>
						);
					})}
				</div>
			)}
		</div>
	);
}
