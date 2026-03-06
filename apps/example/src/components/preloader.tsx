"use client";

import { usePreloader } from "@bnm/curtain";
import { gsap } from "gsap";
import { type FC, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

export const Preloader: FC = () => {
	const { notifyDone } = usePreloader();

	const overlayRef = useRef<HTMLDivElement>(null);
	const [mounted, setMounted] = useState(false);
	const [visible, setVisible] = useState(true);

	useEffect(() => setMounted(true), []);

	useEffect(() => {
		if (!mounted || !overlayRef.current) return;

		const tl = gsap.timeline();

		tl.to({}, { duration: 0.5 });
		tl.add(() => {
			notifyDone();
			if (overlayRef.current) {
				gsap.fromTo(
					overlayRef.current,
					{ clipPath: "inset(0 0 0% 0)" },
					{
						clipPath: "inset(0 0 100% 0)",
						duration: 1.2,
						ease: "expo.inOut",
						onComplete: () => setVisible(false),
					},
				);
			}
		});

		return () => {
			tl.kill();
		};
	}, [mounted]);

	if (!mounted) {
		return (
			<div className="fixed inset-x-0 -top-64 -bottom-64 z-200 bg-foreground" />
		);
	}

	if (!visible) return null;

	return createPortal(
		<div ref={overlayRef} className="fixed inset-0 z-200 bg-foreground" />,
		document.body,
	);
};
