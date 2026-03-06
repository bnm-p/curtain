import { gsap } from "gsap"
import type { AnimationTimeline, AnimationTween, TransitionDef } from "../core/types"

const EASE = "expo.inOut"
const DURATION = 1.2

/**
 * Default transition: clip from top (reveal) + scale-down exit.
 *
 * Exit: the leaving page shrinks and fades out upward.
 * Entry: the incoming page clips in from the top edge downward.
 */
export const defaultTransition: TransitionDef = {
  setInitialState(content: HTMLElement) {
    gsap.set(content, {
      position: "relative",
      zIndex: 2,
      clipPath: "inset(100svh 0% 0% 0%)",
    })
  },

  exit(content: HTMLElement): AnimationTween {
    const tween = gsap.to(content, {
      y: -window.innerHeight * 0.3,
      opacity: 0,
      scale: 0.8,
      transformOrigin: "top center",
      duration: DURATION,
      force3D: true,
      ease: EASE,
    })
    return {
      onComplete(fn) { tween.eventCallback("onComplete", fn); return this },
      kill() { tween.kill() },
    }
  },

  entry(tl: AnimationTimeline, content: HTMLElement) {
    // Always reset to start state before animating.
    // This ensures Strict Mode's 2nd invocation starts from 100svh even if
    // the 1st invocation's tween was killed mid-flight.
    gsap.set(content, { clipPath: "inset(100svh 0% 0% 0%)" })
    tl.to(content, {
      clipPath: "inset(0svh 0% 0% 0%)",
      duration: DURATION,
      force3D: true,
      ease: EASE,
      onComplete: () => {
        gsap.set(content, { clearProps: "clipPath,position,zIndex" })
      },
    })
  },
}
