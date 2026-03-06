"use client";

import { ScrollTrigger, SplitText, gsap } from "@/lib/gsap";
import { usePageEntry, usePageLeave } from "@bnm-p/curtain";
import type { NextPage } from "next";
import { useEffect, useRef } from "react";

const IndexPage: NextPage = () => {
	const titleRef = useRef<HTMLHeadingElement>(null);
	const scrollSectionRef = useRef<HTMLDivElement>(null);

	usePageEntry((tl) => {
		if (!titleRef.current) return;

		const split = new SplitText(titleRef.current, { type: "chars" });

		tl.from(split.chars, {
			y: 60,
			opacity: 0,
			duration: 0.6,
			stagger: 0.04,
			ease: "power3.out",
			onComplete: () => split.revert(),
		});
	});

	usePageLeave((tl) => {
		if (!titleRef.current) return;
		tl.to(titleRef.current, {
			y: -40,
			opacity: 0,
			duration: 0.5,
			ease: "power2.in",
		});
	});

	const imageRef = useRef<HTMLImageElement>(null);

	useEffect(() => {
		const section = scrollSectionRef.current;
		const image = imageRef.current;
		if (!section || !image) return;

		const tween = gsap.to(image, {
			yPercent: -20,
			ease: "none",
			scrollTrigger: {
				trigger: section,
				start: "top bottom",
				end: "bottom top",
				scrub: true,
			},
		});

		return () => {
			tween.scrollTrigger?.kill();
			tween.kill();
		};
	}, []);

	return (
		<>
			<section className="h-svh grid place-items-center">
				<h1 ref={titleRef} className="text-7xl font-light tracking-tighter">
					IndexPage
				</h1>
			</section>

			<section
				ref={scrollSectionRef}
				className="overflow-hidden relative h-[70vh]"
			>
				<img
					ref={imageRef}
					src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1600&q=80"
					alt=""
					className="absolute inset-0 w-full h-[120%] object-cover"
				/>
			</section>
			<section className="h-[50vh]" />
		</>
	);
};

export default IndexPage;
