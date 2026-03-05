"use client";

import { gsap } from "gsap";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useMotionContext } from "./context";

interface PreloaderProps {
	/**
	 * Fully custom render. When provided, `title` and `caption` are ignored.
	 * Call `notifyDone()` when your animation is complete to let page entry
	 * animations proceed.
	 *
	 * @example
	 * <Preloader
	 *   render={({ notifyDone }) => (
	 *     <MyCustomPreloaderContent onComplete={notifyDone} />
	 *   )}
	 * />
	 */
	render?: (props: { notifyDone: () => void }) => React.ReactNode;
}

/**
 * Optional preloader overlay. Blocks page entry animations until the intro
 * sequence is complete. Add to your layout via the `extras` prop on
 * <ViewMotionProvider>:
 *
 * ```tsx
 * <ViewMotionProvider config={motionConfig} extras={<Preloader title="MY NAME" caption="Creative Developer" />}>
 *   {children}
 * </ViewMotionProvider>
 * ```
 *
 * Renders a static background on the server (no flash of content), then
 * animates on the client.
 */
export const Preloader: React.FC<PreloaderProps> = ({ render }) => {
	const overlayRef = useRef<HTMLDivElement>(null);

	const [mounted, setMounted] = useState(false);
	const [visible, setVisible] = useState(true);

	const { registerPreloader, notifyPreloaderDone } = useMotionContext();

	// Block page reveal immediately — must run before any effects so that
	// onPreloaderReady in page-transition doesn't fire before we're ready.
	registerPreloader();

	useEffect(() => setMounted(true), []);

	useEffect(() => {
		if (!mounted) return;
		if (render) return; // Custom render handles its own animation

		if (!overlayRef.current) return;

		const tl = gsap.timeline();
		const exitTweens: gsap.core.Tween[] = [];

		// Hold
		tl.to({}, { duration: 0.5 });

		// Exit: wipe the overlay away from the bottom
		tl.add(() => {
			notifyPreloaderDone();
			if (overlayRef.current) {
				exitTweens.push(
					gsap.fromTo(
						overlayRef.current,
						{ clipPath: "inset(0 0 0% 0)" },
						{
							clipPath: "inset(0 0 100% 0)",
							duration: 1.2,
							ease: "expo.inOut",
							onComplete: () => setVisible(false),
						},
					),
				);
			}
		});

		return () => {
			tl.kill();
		};
	}, [mounted, notifyPreloaderDone, render]);

	// Render a static cover before hydration so the first paint never flashes
	// the page content underneath.
	if (!mounted) {
		return (
			<div className="fixed inset-x-0 -top-64 -bottom-64 z-200 bg-foreground" />
		);
	}

	if (!visible) return null;

	// Custom render — user controls the animation and calls notifyDone()
	if (render) {
		return createPortal(
			<div ref={overlayRef} className="fixed inset-0 z-200">
				{render({ notifyDone: notifyPreloaderDone })}
			</div>,
			document.body,
		);
	}

	return createPortal(
		<div ref={overlayRef} className="fixed inset-0 z-200 bg-foreground" />,
		document.body,
	);
};
