import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import LogosBar from "@/components/LogosBar";
import VideoSection from "@/components/VideoSection";
import HowItWorks from "@/components/HowItWorks";
import WhatViktorDoes from "@/components/WhatViktorDoes";
import Pricing from "@/components/Pricing";
import MarqueeCTA from "@/components/MarqueeCTA";
import Footer from "@/components/Footer";
import AnimObserver from "@/components/AnimObserver";

export default function Home() {
	return (
		<main className="min-h-screen bg-[#faf9f6]">
			<AnimObserver />
			<Navbar />
			<Hero />
			<LogosBar />
			<VideoSection />
			<HowItWorks />
			<WhatViktorDoes />
			<Pricing />
			<MarqueeCTA />
			<Footer />
		</main>
	);
}
