"use client"

import { gsap } from "gsap"
import { useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { useMotionContext } from "../core/context"

interface PreloaderProps {
  /**
   * Name/title text displayed in large type.
   * @default undefined
   */
  title?: string
  /**
   * Small caption displayed above or below the title.
   * @default undefined
   */
  caption?: string
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
  render?: (props: { notifyDone: () => void }) => React.ReactNode
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
export const Preloader: React.FC<PreloaderProps> = ({ title, caption, render }) => {
  const overlayRef = useRef<HTMLDivElement>(null)
  const captionRef = useRef<HTMLSpanElement>(null)
  const wordRefs = useRef<(HTMLSpanElement | null)[]>([])

  const [mounted, setMounted] = useState(false)
  const [visible, setVisible] = useState(true)

  const { notifyPreloaderDone } = useMotionContext()

  useEffect(() => setMounted(true), [])

  useEffect(() => {
    if (!mounted) return
    if (render) return // Custom render handles its own animation

    if (!overlayRef.current) return

    const words = (title ?? "").split(" ")
    const wordEls = wordRefs.current.filter((el): el is HTMLSpanElement => el !== null)

    gsap.set(wordEls, { opacity: 0 })
    if (captionRef.current) gsap.set(captionRef.current, { opacity: 0 })

    // White bars on dark background — fixed so they sit outside the overlay
    // stacking context and render as solid bars over any child content.
    const bars = wordEls.map((wordEl) => {
      const rect = wordEl.getBoundingClientRect()
      const bar = document.createElement("div")
      Object.assign(bar.style, {
        position: "fixed",
        top: `${rect.top}px`,
        left: `${rect.left}px`,
        width: `${rect.width}px`,
        height: `${rect.height}px`,
        background: "var(--background, #ffffff)",
        transformOrigin: "left center",
        transform: "scaleX(0)",
        pointerEvents: "none",
        zIndex: "201",
      })
      document.body.appendChild(bar)
      return bar
    })

    const tl = gsap.timeline()
    const exitTweens: gsap.core.Tween[] = []

    // Bar wipes in from left → word revealed → bar exits right, staggered per word
    wordEls.forEach((word, i) => {
      const bar = bars[i]
      const offset = i * 0.12
      tl.to(bar, { scaleX: 1, duration: 0.55, ease: "expo.in" }, offset)
      tl.set(word, { opacity: 1 }, offset + 0.55)
      tl.set(bar, { transformOrigin: "right center" }, offset + 0.55)
      tl.to(bar, { scaleX: 0, duration: 0.65, ease: "expo.out" }, offset + 0.55)
    })

    // Caption fades in after the word reveal
    if (captionRef.current) {
      tl.to(captionRef.current, { opacity: 0.5, duration: 0.5, ease: "power2.out" }, "-=0.3")
    }

    // Hold
    tl.to({}, { duration: 0.5 })

    // Exit: wipe the overlay away from the bottom
    tl.add(() => {
      for (const bar of bars) bar.remove()
      notifyPreloaderDone()
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
        )
      }
    })

    return () => {
      tl.kill()
      for (const bar of bars) bar.remove()
      for (const tw of exitTweens) tw.kill()
    }
  }, [mounted, notifyPreloaderDone, render, title])

  // Render a static cover before hydration so the first paint never flashes
  // the page content underneath.
  if (!mounted) {
    return <div className="fixed inset-x-0 -top-64 -bottom-64 z-[200] bg-foreground" />
  }

  if (!visible) return null

  // Custom render — user controls the animation and calls notifyDone()
  if (render) {
    return createPortal(
      <div ref={overlayRef} className="fixed inset-0 z-[200]">
        {render({ notifyDone: notifyPreloaderDone })}
      </div>,
      document.body,
    )
  }

  // Built-in bar-wipe preset
  const words = (title ?? "").split(" ")

  return createPortal(
    <div ref={overlayRef} className="fixed inset-0 z-[200] bg-foreground">
      <div className="flex h-svh flex-col justify-between p-4">
        {caption && (
          <span ref={captionRef} className="text-sm uppercase tracking-widest text-background/50">
            {caption}
          </span>
        )}

        {title && (
          <div
            className="text-[clamp(3rem,7vw,9rem)] uppercase leading-[.85] tracking-[-0.04em] text-background"
            aria-label={title}
          >
            {words.map((word, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: static word list
              <span key={i}>
                <span
                  ref={(el) => {
                    wordRefs.current[i] = el
                  }}
                  className="inline-block"
                  aria-hidden="true"
                >
                  {word}
                </span>
                {i < words.length - 1 && <span className="inline-block">&nbsp;</span>}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>,
    document.body,
  )
}
