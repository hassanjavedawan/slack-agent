import { useQuery } from "@tanstack/react-query";
import { type FormEvent, useState } from "react";
import type { SuperadminData } from "../lib/api";
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

function LoginForm({ onSuccess }: { onSuccess: () => void }) {
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);

	const handleSubmit = async (e: FormEvent) => {
		e.preventDefault();
		setError("");
		setLoading(true);
		try {
			const res = await fetch("/api/auth/login", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				credentials: "include",
				body: JSON.stringify({ username, password }),
			});
			if (!res.ok) {
				const body = await res.json().catch(() => ({}));
				setError(body.error || "Login failed");
				return;
			}
			onSuccess();
		} catch {
			setError("Network error");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="flex min-h-screen items-center justify-center bg-slate-50">
			<div className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
				<div className="mb-6 text-center">
					<h1 className="text-xl font-bold text-slate-900">Superadmin</h1>
					<p className="mt-1 text-sm text-slate-500">Sign in with admin credentials</p>
				</div>
				<form onSubmit={handleSubmit} className="space-y-4">
					<div>
						<label htmlFor="username" className="block text-sm font-medium text-slate-700 mb-1">
							Username
						</label>
						<input
							id="username"
							type="text"
							value={username}
							onChange={(e) => setUsername(e.target.value)}
							className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
							required
						/>
					</div>
					<div>
						<label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">
							Password
						</label>
						<input
							id="password"
							type="password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
							required
						/>
					</div>
					{error && (
						<div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
					)}
					<button
						type="submit"
						disabled={loading}
						className="w-full rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
					>
						{loading ? "Signing in..." : "Sign in"}
					</button>
				</form>
			</div>
		</div>
	);
}

function Dashboard({ data }: { data: SuperadminData }) {
	const { summary, workspaces } = data;
	const totalMembers = workspaces.reduce((s, w) => s + w.members, 0);

	return (
		<div className="min-h-screen bg-slate-50">
			<nav className="border-b border-slate-200 bg-white px-6 h-14 flex items-center">
				<h1 className="text-sm font-bold tracking-wide text-slate-900">OPENVIKTOR SUPERADMIN</h1>
			</nav>
			<main className="max-w-6xl mx-auto p-6 space-y-6">
				<div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
					<div className="rounded-xl border border-slate-200 bg-white p-5">
						<div className="text-xs font-medium text-slate-500 mb-1">Workspaces</div>
						<div className="text-2xl font-bold text-slate-900">{summary.totalWorkspaces}</div>
						<div className="text-xs text-slate-400">{summary.activeWorkspaces} active</div>
					</div>
					<div className="rounded-xl border border-slate-200 bg-white p-5">
						<div className="text-xs font-medium text-slate-500 mb-1">Runs (24h)</div>
						<div className="text-2xl font-bold text-slate-900">{summary.totalRuns24h}</div>
					</div>
					<div className="rounded-xl border border-slate-200 bg-white p-5">
						<div className="text-xs font-medium text-slate-500 mb-1">Total Members</div>
						<div className="text-2xl font-bold text-slate-900">{totalMembers}</div>
					</div>
				</div>

				<div className="rounded-xl border border-slate-200 bg-white p-5">
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
										<td className="py-2.5 pr-4 font-medium text-slate-900">{ws.slackTeamName}</td>
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
				</div>
			</main>
		</div>
	);
}

export function SuperadminPage() {
	const [authed, setAuthed] = useState(false);

	const { data, isLoading, error, refetch } = useQuery({
		queryKey: ["superadmin"],
		queryFn: getSuperadmin,
		refetchInterval: authed ? 30_000 : false,
		enabled: authed,
		retry: false,
	});

	// Try fetching on mount to see if already logged in
	const { data: checkData, isLoading: checking } = useQuery({
		queryKey: ["superadmin-check"],
		queryFn: getSuperadmin,
		retry: false,
	});

	if (checking) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-slate-50">
				<div className="text-sm text-slate-400">Loading...</div>
			</div>
		);
	}

	if (!authed && !checkData) {
		return (
			<LoginForm
				onSuccess={() => {
					setAuthed(true);
					refetch();
				}}
			/>
		);
	}

	const displayData = data || checkData;

	if (isLoading && !displayData) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-slate-50">
				<div className="text-sm text-slate-400">Loading dashboard...</div>
			</div>
		);
	}

	if (error && !displayData) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-slate-50">
				<div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
					Failed to load data. Check your credentials.
				</div>
			</div>
		);
	}

	if (!displayData) return null;

	return <Dashboard data={displayData} />;
}
