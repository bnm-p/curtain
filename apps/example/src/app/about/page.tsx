"use client";

import { usePageEntry, usePageLeave } from "@bnm/curtain";
import type { NextPage } from "next";

const AboutPage: NextPage = () => {
	usePageEntry((tl) => {
		tl.from(".title", { y: 40, opacity: 0, duration: 0.6 });
	});

	usePageLeave((tl) => {
		tl.to(".title", { scale: 0, opacity: 0, duration: 0.6 }, ">");
	});

	return (
		<div className="h-svh grid place-items-center">
			<h1 className="title | text-7xl font-light tracking-tighter">
				AboutPage
			</h1>
		</div>
	);
};

export default AboutPage;
