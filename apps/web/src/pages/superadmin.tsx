import { useQuery } from "@tanstack/react-query";
import { Activity, Globe, Users, Zap } from "lucide-react";
import { Card } from "../components/ui/card";
import { StatCard } from "../components/ui/stat-card";
import { getSuperadmin } from "../lib/api";

function timeAgo(iso: string): string {
	const diff = Date.now() - new Date(iso).getTime();
	const mins = Math.floor(diff / 60_000);
	if (mins < 60) return `${mins}m ago`;
	const hours = Math.floor(mins / 60);
	if (hours < 24) return `${hours}h ago`;
	const days = Math.floor(hours / 24);
	return `${days}d ago`;
}

export function SuperadminPage() {
	const { data, isLoading, error } = useQuery({
		queryKey: ["superadmin"],
		queryFn: getSuperadmin,
		refetchInterval: 30_000,
	});

	if (isLoading) {
		return (
			<div className="space-y-6">
				<div className="h-8 w-48 animate-pulse rounded bg-slate-200" />
				<div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
					{[1, 2, 3].map((k) => (
						<div key={k} className="h-24 animate-pulse rounded-xl border border-slate-200 bg-white" />
					))}
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
				Failed to load superadmin data. You may not have permission.
			</div>
		);
	}

	if (!data) return null;

	const { summary, workspaces } = data;

	return (
		<div className="space-y-6">
			<h1 className="text-2xl font-bold text-slate-900">Superadmin</h1>

			<div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
				<StatCard
					label="Workspaces"
					value={String(summary.totalWorkspaces)}
					subValue={`${summary.activeWorkspaces} active`}
					icon={Globe}
					color="primary"
				/>
				<StatCard
					label="Runs (24h)"
					value={String(summary.totalRuns24h)}
					icon={Zap}
					color="emerald"
				/>
				<StatCard
					label="Total Members"
					value={String(workspaces.reduce((s, w) => s + w.members, 0))}
					icon={Users}
					color="primary"
				/>
			</div>

			<Card>
				<h3 className="mb-4 text-sm font-semibold text-slate-900">All Workspaces</h3>
				<div className="overflow-x-auto">
					<table className="w-full text-sm">
						<thead>
							<tr className="border-b border-slate-200 text-left text-xs text-slate-500">
								<th className="pb-2 pr-4 font-medium">Workspace</th>
								<th className="pb-2 pr-4 font-medium">Members</th>
								<th className="pb-2 pr-4 font-medium">Runs</th>
								<th className="pb-2 pr-4 font-medium">Threads</th>
								<th className="pb-2 pr-4 font-medium">Runs (24h)</th>
								<th className="pb-2 pr-4 font-medium">Cost (7d)</th>
								<th className="pb-2 pr-4 font-medium">Last Activity</th>
								<th className="pb-2 font-medium">Status</th>
							</tr>
						</thead>
						<tbody>
							{workspaces.map((ws) => (
								<tr key={ws.id} className="border-b border-slate-100">
									<td className="py-2.5 pr-4 font-medium text-slate-900">
										{ws.slackTeamName}
									</td>
									<td className="py-2.5 pr-4 text-slate-600">{ws.members}</td>
									<td className="py-2.5 pr-4 text-slate-600">{ws.totalRuns}</td>
									<td className="py-2.5 pr-4 text-slate-600">{ws.totalThreads}</td>
									<td className="py-2.5 pr-4 text-slate-600">{ws.runsLast24h}</td>
									<td className="py-2.5 pr-4 text-slate-600">
										${(ws.costLast7dCents / 100).toFixed(2)}
									</td>
									<td className="py-2.5 pr-4 text-slate-500">
										{ws.lastActivity ? timeAgo(ws.lastActivity) : "—"}
									</td>
									<td className="py-2.5">
										<span
											className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
												ws.isActive
													? "bg-emerald-50 text-emerald-700"
													: "bg-slate-100 text-slate-500"
											}`}
										>
											<span
												className={`h-1.5 w-1.5 rounded-full ${ws.isActive ? "bg-emerald-500" : "bg-slate-400"}`}
											/>
											{ws.isActive ? "Active" : "Inactive"}
										</span>
									</td>
								</tr>
							))}
							{workspaces.length === 0 && (
								<tr>
									<td colSpan={8} className="py-8 text-center text-slate-400">
										No workspaces connected yet.
									</td>
								</tr>
							)}
						</tbody>
					</table>
				</div>
			</Card>
		</div>
	);
}
