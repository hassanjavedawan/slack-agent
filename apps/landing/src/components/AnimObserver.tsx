"use client";

import { useEffect } from "react";

export default function AnimObserver() {
	useEffect(() => {
		const els = document.querySelectorAll<HTMLElement>(".anim-section");
		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((e) => {
					if (e.isIntersecting) {
						e.target.classList.add("in-view");
					}
				});
			},
			{ threshold: 0.08 },
		);
		els.forEach((el) => observer.observe(el));
		return () => observer.disconnect();
	}, []);

	return null;
}
