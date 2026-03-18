import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../lib/api";

export function LoginPage() {
	const navigate = useNavigate();
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		setError("");
		setLoading(true);
		try {
			await login(username, password);
			navigate("/dashboard");
		} catch {
			setError("Invalid username or password");
		} finally {
			setLoading(false);
		}
	}

	return (
		<div className="flex min-h-screen items-center justify-center bg-[#f7fbfd]">
			<div className="w-full max-w-sm rounded-xl border border-[#d6eaef] bg-white p-8 shadow-sm">
				<div className="mb-6 flex flex-col items-center gap-2">
					<img src="https://relymer.com/black-logo.png" alt="Relymer" className="h-10 w-10" />
					<h1
						className="text-lg font-bold tracking-[0.1em] text-[#111]"
						style={{ fontFamily: "'Manrope', sans-serif" }}
					>
						Relymer
					</h1>
				</div>

				<form onSubmit={handleSubmit} className="space-y-4">
					<div>
						<label htmlFor="username" className="mb-1 block text-sm font-medium text-[#6b7080]">
							Username
						</label>
						<input
							id="username"
							type="text"
							value={username}
							onChange={(e) => setUsername(e.target.value)}
							required
							className="w-full rounded-lg border border-[#d6eaef] bg-[#fafcfd] px-3 py-2 text-sm text-[#111] outline-none focus:border-[#1e6a8a] focus:ring-1 focus:ring-[#1e6a8a]"
						/>
					</div>
					<div>
						<label htmlFor="password" className="mb-1 block text-sm font-medium text-[#6b7080]">
							Password
						</label>
						<input
							id="password"
							type="password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							required
							className="w-full rounded-lg border border-[#d6eaef] bg-[#fafcfd] px-3 py-2 text-sm text-[#111] outline-none focus:border-[#1e6a8a] focus:ring-1 focus:ring-[#1e6a8a]"
						/>
					</div>

					{error && <p className="text-sm text-red-600">{error}</p>}

					<button
						type="submit"
						disabled={loading}
						className="w-full rounded-lg bg-[#1e6a8a] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#185a76] disabled:opacity-50"
					>
						{loading ? "Signing in..." : "Sign in"}
					</button>
				</form>
			</div>
		</div>
	);
}
