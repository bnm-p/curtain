"use client"

import { useEffect, useRef } from "react"
import type { AnimationFn } from "../context"
import { useMotionContext } from "../context"

/**
 * Register entry animations for the current page.
 *
 * Called with a timeline function — tweens added to `tl` run after the page
 * clip reveal, coordinated with the transition:
 * ```ts
 * usePageEntry((tl) => {
 *   tl.from('.hero', { y: 40, opacity: 0, duration: 0.6 })
 *   tl.from('.subtitle', { opacity: 0 }, '<0.1')
 * })
 * ```
 *
 * Called with a zero-argument function — runs freely after the transition,
 * useful for custom setups that need their own timeline control:
 * ```ts
 * usePageEntry(() => {
 *   runBarWipe(document.querySelectorAll('.item'))
 * })
 * ```
 */
export function usePageEntry(fn: AnimationFn) {
  const { setEntryAnimations } = useMotionContext()
  // Keep a ref so the effect doesn't need fn in its deps but always calls
  // the latest version.
  const fnRef = useRef<AnimationFn>(fn)
  fnRef.current = fn

  useEffect(() => {
    setEntryAnimations((...args: Parameters<AnimationFn>) =>
      // @ts-expect-error: args spread works for both overloads
      fnRef.current(...args),
    )
  }, [setEntryAnimations])
}
