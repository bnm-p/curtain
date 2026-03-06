"use client"

import { useEffect, useRef } from "react"
import type { AnimationFn, FreeAnimationFn, TimelineAnimationFn } from "../types"
import { useMotionContext } from "../context"

/**
 * Register exit animations for the current page's elements.
 *
 * Runs on the ghost clone when the user navigates away, scoped so selectors
 * only target elements within the leaving page — not the incoming one.
 *
 * Called with a timeline function:
 * ```ts
 * usePageLeave((tl) => {
 *   tl.to('.hero', { y: -40, opacity: 0, duration: 0.5 })
 * })
 * ```
 *
 * Called with a zero-argument function for free control:
 * ```ts
 * usePageLeave(() => {
 *   gsap.to('.hero', { y: -40, opacity: 0 })
 * })
 * ```
 *
 * Optional — if not used, the page simply stays at its current state
 * while the transition exit animation runs on the ghost.
 */
export function usePageLeave(fn: AnimationFn) {
  const { setLeaveAnimations } = useMotionContext()
  const fnRef = useRef<AnimationFn>(fn)
  fnRef.current = fn

  const isTimeline = fn.length > 0

  useEffect(() => {
    if (isTimeline) {
      setLeaveAnimations((tl) =>
        (fnRef.current as TimelineAnimationFn)(tl),
      )
    } else {
      setLeaveAnimations(() => (fnRef.current as FreeAnimationFn)())
    }

    // Clear on unmount so stale leave animations don't run when navigating
    // from a page that has usePageLeave to one that doesn't.
    return () => setLeaveAnimations(null)
  }, [setLeaveAnimations, isTimeline])
}
