import { HumalikeLogo } from "./Navbar";

const productLinks = [
	{ label: "How it works", href: "#how-it-works" },
	{ label: "Pricing", href: "#pricing" },
];

const legalLinks = [
	{ label: "ISO 27001", href: "/compliance" },
	{ label: "SOC 2 Type 2", href: "/compliance" },
];

export default function Footer() {
	return (
		<footer className="border-t border-[#E5E2DC] pt-16 pb-10 px-6">
			<div className="max-w-7xl mx-auto">
				<div className="grid grid-cols-2 md:grid-cols-6 gap-10 mb-16">
					<div className="col-span-2">
						<div className="mb-4">
							<HumalikeLogo height={20} />
						</div>
						<p className="text-[#A8A49E] text-sm leading-relaxed max-w-[280px]">
							The AI employee for any role.
						</p>
					
					</div>

					<div>
						<div className="text-[#111] text-xs font-semibold tracking-widest uppercase mb-4">
							Product
						</div>
						<div className="flex flex-col gap-3">
							{productLinks.map((l) => (
								<a
									key={l.label}
									href={l.href}
									className="text-[#6B6863] text-sm hover:text-[#111] transition-colors"
								>
									{l.label}
								</a>
							))}
						</div>
					</div>

					<div>
						<div className="text-[#111] text-xs font-semibold tracking-widest uppercase mb-4">
							Legal
						</div>
						<div className="flex flex-col gap-3">
							{legalLinks.map((l) => (
								<a
									key={l.label}
									href={l.href}
									className="text-[#6B6863] text-sm hover:text-[#111] transition-colors"
								>
									{l.label}
								</a>
							))}
						</div>
					</div>

					<div className="col-span-2 md:col-span-1">
						<div className="text-[#111] text-xs font-semibold tracking-widest uppercase mb-4">
							Contact
						</div>
						<a
							href="mailto:mtk@soofte.com"
							className="text-[#6B6863] text-sm hover:text-[#111] transition-colors block"
						>
							Email us →
						</a>
					</div>
				</div>

				<div className="border-t border-[#E5E2DC] pt-6 text-[#C8C4BD] text-xs">
					© 2026 HUMALIKE. All rights reserved.
				</div>
			</div>
		</footer>
	);
}
