import { useEffect, useState } from "react";

function HumalikeLogo({ height = 28 }: { height?: number }) {
	return (
		<a href="/" className="flex items-center gap-1.5">
			<img
				src="https://relymer.com/black-logo.png"
				alt="Relymer"
				className="object-contain"
				style={{ width: height, height: height }}
			/>
			<span
				style={{
					fontFamily: "var(--font-manrope,'Manrope',sans-serif)",
					fontWeight: 700,
					fontSize: height * 0.85,
					letterSpacing: "0.07em",
					color: "#111",
					lineHeight: 1,
				}}
			>
				Relymer
			</span>
		</a>
	);
}

export { HumalikeLogo };

export default function Navbar() {
	const [mobileOpen, setMobileOpen] = useState(false);
	const [scrolled, setScrolled] = useState(false);

	useEffect(() => {
		const onScroll = () => setScrolled(window.scrollY > 10);
		window.addEventListener("scroll", onScroll, { passive: true });
		return () => window.removeEventListener("scroll", onScroll);
	}, []);

	return (
		<nav
			className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
			style={{
				background: scrolled ? "#fff" : "transparent",
				boxShadow: scrolled ? "0 1px 0 rgba(0,0,0,0.06)" : "none",
			}}
		>
			<div className="max-w-7xl mx-auto px-6 h-[60px] flex items-center justify-between">
				<div className="flex items-center gap-8">
					<HumalikeLogo height={20} />

					<div className="hidden md:flex items-center gap-6">
						<a
							href="#how-it-works"
							className="text-sm text-[#6B6863] hover:text-[#111] transition-colors"
						>
							How it works
						</a>
						<a
							href="#pricing"
							className="text-sm text-[#6B6863] hover:text-[#111] transition-colors"
						>
							Pricing
						</a>
						<a
							href="https://www.humalike.ai/"
							target="_blank"
							rel="noopener noreferrer"
							className="text-sm text-[#6B6863] hover:text-[#111] transition-colors"
						>
							HUMALIKE
						</a>
					</div>
				</div>

				<div className="flex items-center gap-3">
					<a
						href="/login"
						className="text-sm text-[#6B6863] hover:text-[#111] transition-colors hidden sm:block"
					>
						Sign in
					</a>
			
				

					<button
						type="button"
						className="md:hidden flex flex-col justify-center items-center w-8 h-8 gap-[5px] bg-transparent border-none cursor-pointer p-0"
						aria-label="Menu"
						onClick={() => setMobileOpen(!mobileOpen)}
					>
						<span
							className={`block w-5 h-[1.5px] bg-[#111] transition-all duration-200 origin-center ${mobileOpen ? "rotate-45 translate-y-[6.5px]" : ""}`}
						/>
						<span
							className={`block w-5 h-[1.5px] bg-[#111] transition-all duration-200 ${mobileOpen ? "opacity-0" : ""}`}
						/>
						<span
							className={`block w-5 h-[1.5px] bg-[#111] transition-all duration-200 origin-center ${mobileOpen ? "-rotate-45 -translate-y-[6.5px]" : ""}`}
						/>
					</button>
				</div>
			</div>

			{mobileOpen && (
				<div
					className="md:hidden border-t border-[#d6eaef] px-6 py-5 flex flex-col gap-4"
					style={{ background: "#e5f4f8" }}
				>
					{[
						{ label: "How it works", href: "#how-it-works" },
						{ label: "Pricing", href: "#pricing" },
					].map((l) => (
						<a
							key={l.label}
							href={l.href}
							className="text-sm text-[#6B6863] hover:text-[#111] transition-colors"
							onClick={() => setMobileOpen(false)}
							{...(l.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
						>
							{l.label}
						</a>
					))}
					<div className="flex gap-3 pt-2 border-t border-[#d6eaef]">
						<a href="/login" className="text-sm text-[#6B6863] hover:text-[#111]">
							Sign in
						</a>
					</div>
				</div>
			)}
		</nav>
	);
}
